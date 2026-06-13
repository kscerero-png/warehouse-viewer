import { useStore } from '../../store';
import { useMemo } from 'react';
import { calculateCapacityUsageForAisle, calculateCapacityUsageForAisleGroup } from '../../utils/capacity';

export default function ZoneOccupancy() {
  const showZoneOccupancy = useStore((s) => s.showZoneOccupancy);
  const datosInventario = useStore((s) => s.datosInventario);
  const rackCounts = useStore((s) => s.rackCounts);

  const zones = useMemo(() => {
    const d = datosInventario;
    const rc = rackCounts;
    return {
      '1-4': calculateCapacityUsageForAisleGroup(['1', '2', '3', '4'], d, rc),
      '5-9': calculateCapacityUsageForAisleGroup(['5', '6', '7', '8', '9'], d, rc),
      T: calculateCapacityUsageForAisle('T', d, rc),
      A: calculateCapacityUsageForAisle('A', d, rc),
      P: calculateCapacityUsageForAisle('P', d, rc),
      S: calculateCapacityUsageForAisle('S', d, rc),
    };
  }, [datosInventario, rackCounts]);

  if (!showZoneOccupancy || Object.keys(rackCounts).length === 0) return null;

  return (
    <div id="zone-occupancy">
      <div className="card-title" style={{ padding: '8px 12px 0' }}>Ocupación por Zona</div>
      <div style={{ padding: '4px 12px 12px' }}>
        <ZoneBar label="Almacén Principal" id="zo-primary" cls="zo-primary" data={zones['1-4']} />
        <ZoneBar label="CAVA" id="zo-cava" cls="zo-cava" data={zones['5-9']} />
        <ZoneBar label="Tránsito" id="zo-t" cls="zo-t" data={zones.T} />
        <ZoneBar label="Formulación" id="zo-a" cls="zo-a" data={zones.A} />
        <ZoneBar label="Galpón Anexo" id="zo-p" cls="zo-p" data={zones.P} />
        <ZoneBar label="Jaula" id="zo-s" cls="zo-s" data={zones.S} />
      </div>
    </div>
  );
}

function ZoneBar({ label, id, cls, data }: {
  label: string; id: string; cls: string; data: { total: number; used: number; empty: number; percent: number };
}) {
  return (
    <div className={`zone-item ${cls}`}>
      <div className="zone-label-row">
        <span className="zone-label">{label}</span>
        <span className="zone-stats">{data.used}/{data.total} ({data.percent}%)</span>
      </div>
      <div className="zone-bar">
        <div className="zone-bar-fill" id={id} style={{ width: `${data.percent}%` }} />
      </div>
    </div>
  );
}
