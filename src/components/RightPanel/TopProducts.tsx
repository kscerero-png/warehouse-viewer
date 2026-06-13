import { useStore } from '../../store';

export default function TopProducts() {
  const topProducts = useStore((s) => s.topProducts);

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #333' }}>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>
        Top Productos
      </div>
      {topProducts.slice(0, 5).map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
          <span style={{ color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {p.name}
          </span>
          <span style={{ color: '#e0e0e0', fontWeight: 600, marginLeft: 8 }}>{p.count}</span>
        </div>
      ))}
    </div>
  );
}
