import { useMemo } from 'react';
import { useStore } from '../../store';

const R = 33;
const CIRC = 2 * Math.PI * R;
const SEGMENTS = [
  { key: 'liberado', label: 'Liberado', color: '#2563eb', status: 'liberado' as const },
  { key: 'retenido', label: 'Retenido', color: '#d97706', status: 'retenido' as const },
  { key: 'rechazado', label: 'Rechazado', color: '#dc2626', status: 'rechazado' as const },
  { key: 'vacio', label: 'Vacío', color: 'rgba(255,255,255,0.15)', status: '' as const },
];

export default function StatusDonut() {
  const statusBreakdown = useStore((s) => s.statusBreakdown);
  const currentStatusFilter = useStore((s) => s.currentStatusFilter);
  const setStatusFilter = useStore((s) => s.setStatusFilter);

  const { retenido, rechazado, liberado, vacio, pctRetenido, pctRechazado, pctLiberado, pctVacio } = statusBreakdown;
  const pcts = [pctLiberado, pctRetenido, pctRechazado, pctVacio];

  const arcs = useMemo(() => {
    let cumulative = 0;
    return pcts.map((pct) => {
      const len = (pct / 100) * CIRC;
      const offset = cumulative === 0 ? 0 : -(CIRC * cumulative) / 100;
      cumulative += pct;
      return { len, offset };
    });
  }, [pcts]);

  const toggle = (status: string) => {
    if (currentStatusFilter === status) setStatusFilter(null);
    else setStatusFilter(status as any);
  };

  return (
    <div className="md-card" id="donut-status">
      <div className="card-title">Estado</div>
      <div className="donut-placeholder">
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
          {SEGMENTS.map((seg, i) => (
            <circle
              key={seg.key}
              cx="40" cy="40" r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="6"
              strokeDasharray={arcs[i].len > 0 ? `${arcs[i].len} ${CIRC - arcs[i].len}` : `0 ${CIRC}`}
              strokeDashoffset={arcs[i].offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
      </div>
      <div className="status-list" id="donut-status-list">
        <StatusBar label="Liberado" count={liberado} pct={pctLiberado} color="#2563eb" status="liberado" active={currentStatusFilter === 'liberado'} onClick={() => toggle('liberado')} />
        <StatusBar label="Retenido" count={retenido} pct={pctRetenido} color="#d97706" status="retenido" active={currentStatusFilter === 'retenido'} onClick={() => toggle('retenido')} />
        <StatusBar label="Rechazado" count={rechazado} pct={pctRechazado} color="#dc2626" status="rechazado" active={currentStatusFilter === 'rechazado'} onClick={() => toggle('rechazado')} />
        <StatusBar label="Vacío" count={vacio} pct={pctVacio} color="rgba(255,255,255,0.15)" status="" active={false} onClick={() => {}} />
      </div>
    </div>
  );
}

function StatusBar({ label, count, pct, color, status, active, onClick }: {
  label: string; count: number; pct: number; color: string; status: string; active: boolean; onClick: () => void;
}) {
  const size = pct > 0 ? pct : (count > 0 ? 2 : 0);
  return (
    <div
      className={`status-row ${active ? 'active' : ''}`}
      data-status={status}
      onClick={onClick}
      style={{ cursor: status ? 'pointer' : 'default' }}
    >
      <span className="status-label">{label}</span>
      <div className="status-bar">
        <div className="bar-fill" id={`bar-${label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`} style={{ width: `${size}%`, background: color }} />
      </div>
      <span className="status-qty">{count}</span>
    </div>
  );
}
