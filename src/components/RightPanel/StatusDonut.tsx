import { useStore } from '../../store';

export default function StatusDonut() {
  const statusBreakdown = useStore((s) => s.statusBreakdown);
  const currentStatusFilter = useStore((s) => s.currentStatusFilter);
  const setStatusFilter = useStore((s) => s.setStatusFilter);

  const { retenido, rechazado, liberado, vacio, pctRetenido, pctRechazado, pctLiberado, pctVacio } = statusBreakdown;

  const toggle = (status: string) => {
    if (currentStatusFilter === status) setStatusFilter(null);
    else setStatusFilter(status as any);
  };

  return (
    <div className="md-card" id="donut-status">
      <div className="card-title">Estado</div>
      <div className="donut-placeholder">
        <div className="donut-ring" style={{ borderColor: '#2563eb #d97706 #dc2626 rgba(255,255,255,0.06)' }} />
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
