import { useStore } from '../store';

export default function KpiBar() {
  const datosInventario = useStore((s) => s.datosInventario);
  const total = datosInventario.length;
  const used = datosInventario.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div
      style={{
        height: 72,
        background: '#1e1e2e',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        padding: '0 24px',
      }}
    >
      <Kpi label="Total Ubicaciones" value={String(total)} />
      <Kpi label="Ocupadas" value={String(used)} />
      <Kpi label="Ocupación" value={`${pct}%`} />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#e0e0e0', marginTop: 2 }}>{value}</div>
    </div>
  );
}
