import { useStore } from '../../store';

export default function TopProducts() {
  const topProducts = useStore((s) => s.topProducts);

  return (
    <div className="md-card">
      <div className="card-title">Top Productos</div>
      <div id="top-products-list">
        {topProducts.slice(0, 5).map((p, i) => (
          <div key={i} className="top-product-row">
            <span className="top-product-idx">#{i + 1}</span>
            <span className="top-product-name">{p.name}</span>
            <span className="top-product-count">{p.count}</span>
          </div>
        ))}
        {topProducts.length === 0 && (
          <div style={{ fontSize: 12, color: '#64748b', padding: '8px 0' }}>Sin datos</div>
        )}
      </div>
    </div>
  );
}
