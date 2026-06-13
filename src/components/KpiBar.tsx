import { useStore } from '../store';

export default function KpiBar() {
  const datosInventario = useStore((s) => s.datosInventario);
  const statusBreakdown = useStore((s) => s.statusBreakdown);

  const total = datosInventario.length;
  const used = datosInventario.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div id="kpi-bar">
      <KpiCard label="Total Ubicaciones" value={String(total)} colorClass="kpi-blue" />
      <KpiCard label="Ocupación" value={`${pct}%`} colorClass="kpi-green" />
      <KpiCard label="Retenidos" value={String(statusBreakdown.retenido)} colorClass="kpi-amber" />
      <KpiCard label="Rechazados" value={String(statusBreakdown.rechazado)} colorClass="kpi-red" />
      <div className="kpi-actions" />
    </div>
  );
}

function KpiCard({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className={`kpi-card ${colorClass}`}>
      <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}
