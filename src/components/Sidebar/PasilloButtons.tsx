import { useStore } from '../../store';
import { getAisleGroupLabel } from '../../utils/idHelpers';

const PASILLOS: { label: string; value: string; badge: string; zoneClass?: string }[] = [
  { label: 'Todos', value: 'todos', badge: 'General' },
  { label: '01', value: '1', badge: 'Ppal' },
  { label: '02', value: '2', badge: 'Ppal' },
  { label: '03', value: '3', badge: 'Ppal' },
  { label: '04', value: '4', badge: 'Ppal' },
  { label: '05', value: '5', badge: 'Cava' },
  { label: '06', value: '6', badge: 'Cava' },
  { label: '07', value: '7', badge: 'Cava' },
  { label: '08', value: '8', badge: 'Cava' },
  { label: '09', value: '9', badge: 'Cava' },
  { label: 'T', value: 'T', badge: 'Tránsito', zoneClass: 'zone-t' },
  { label: 'F', value: 'A', badge: 'Formulación', zoneClass: 'zone-a' },
  { label: 'P', value: 'P', badge: 'Galpón Anexo', zoneClass: 'zone-p' },
  { label: 'J', value: 'S', badge: 'Jaula', zoneClass: 'zone-s' },
];

export default function PasilloButtons() {
  const pasilloSeleccionado = useStore((s) => s.pasilloSeleccionado);
  const setPasillo = useStore((s) => s.setPasillo);
  const zoneMetrics = useStore((s) => s.zoneMetrics);

  return (
    <div className="sidebar-nav">
      <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, padding: '12px 10px 6px' }}>
        Pasillos
      </div>
      <div className="nav-aisle-grid" id="pasillo-buttons-container">
        {PASILLOS.map((p) => {
          const isActive = pasilloSeleccionado === p.value;
          const metric = zoneMetrics[p.value];
          const pct = metric ? `${metric.percent}%` : '--';
          return (
            <button
              key={p.value}
              className={`nav-btn ${isActive ? 'active' : ''} ${p.zoneClass || ''}`}
              data-pasillo={p.value}
              onClick={() => setPasillo(p.value as any)}
              title={`${p.label}: ${pct} ocupado`}
            >
              {p.label}
              <span className="nav-badge">{pct}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
