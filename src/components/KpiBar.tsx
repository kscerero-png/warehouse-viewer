import { useStore } from '../store';

export default function KpiBar() {
  const datosInventario = useStore((s) => s.datosInventario);
  const statusBreakdown = useStore((s) => s.statusBreakdown);
  const rackCounts = useStore((s) => s.rackCounts);

  const totalRacks = Object.values(rackCounts).reduce((sum, c) => sum + c, 0);
  const usedIds = new Set<string>();
  datosInventario.forEach((e) => {
    if ((parseInt(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0) {
      usedIds.add(e.id);
    }
  });
  const pct = totalRacks > 0 ? Math.round((usedIds.size / totalRacks) * 100) : 0;

  return (
    <div id="kpi-bar">
      <KpiCard label="Total Ubicaciones" value={String(totalRacks)} colorClass="kpi-blue" />
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
