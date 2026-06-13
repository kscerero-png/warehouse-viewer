import { useStore } from '../../store';

export default function StatusDonut() {
  const statusBreakdown = useStore((s) => s.statusBreakdown);
  const { retenido, rechazado, liberado, pctRetenido, pctRechazado } = statusBreakdown;

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #333' }}>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 12 }}>Estado</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <Bar label="Liberado" count={liberado} color="#4caf50" />
        <Bar label="Retenido" count={retenido} pct={pctRetenido} color="#ff9800" />
        <Bar label="Rechazado" count={rechazado} pct={pctRechazado} color="#f44336" />
      </div>
    </div>
  );
}

function Bar({ label, count, color, pct }: { label: string; count: number; color: string; pct?: number }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
        {label}{pct !== undefined ? ` (${pct}%)` : ''}
      </div>
    </div>
  );
}
