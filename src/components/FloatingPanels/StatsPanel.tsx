import { useStore } from '../../store';

export default function StatsPanel() {
  const productStats = useStore((s) => s.productStats);
  const showStatsPanel = useStore((s) => s.showStatsPanel);
  const setProductStats = useStore((s) => s.setProductStats);

  if (!showStatsPanel || !productStats) return null;

  return (
    <div className="floating-panel visible panel-stats" style={{
      position: 'absolute',
      right: 12,
      top: 16,
      zIndex: 60,
    }}>
      <div className="floating-panel-header">
        <span className="floating-panel-title">Estadísticas</span>
        <button className="floating-panel-close" id="stats-close" onClick={() => setProductStats(null)}>✕</button>
      </div>
      <div className="floating-panel-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }} id="stats-product-name">
          {productStats.canonName}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }} id="stats-sku">
          SKU: {productStats.canonCod}
        </div>

        <div className="stats-metric-row">
          <div className="stats-metric">
            <div className="stats-metric-value" id="stats-total-ubics">{productStats.totalUbics}</div>
            <div className="stats-metric-label">Ubicaciones</div>
          </div>
          <div className="stats-metric">
            <div className="stats-metric-value" id="stats-total-qty">
              {productStats.totalQty % 1 === 0 ? productStats.totalQty : productStats.totalQty.toFixed(2)}
            </div>
            <div className="stats-metric-label" id="stats-um-label">{productStats.canonUm || 'Unidades'}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, marginTop: 8 }}>Lotes</div>
        <div id="stats-lotes-list" style={{ maxHeight: 200, overflowY: 'auto' }}>
          {productStats.lotes.length === 0 ? (
            <div className="stats-no-data">Sin lotes registrados</div>
          ) : (
            productStats.lotes.slice(0, 10).map((l, i) => (
              <div key={i} className="stats-lote-row">
                <span className="stats-lote-name" title={l.name}>{l.name}</span>
                <span className="stats-lote-meta">
                  <span className="stats-lote-ubics">{l.ubics.length} ubic.</span>
                  <span className="stats-lote-qty">{l.qty >= 1000 ? l.qty.toLocaleString('es') : l.qty}</span>
                </span>
              </div>
            ))
          )}
          {productStats.lotes.length > 10 && (
            <div className="stats-no-data" style={{ textAlign: 'center', padding: 4 }}>
              + {productStats.lotes.length - 10} lotes más
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, marginTop: 8 }}>Ubicaciones</div>
        <div id="stats-ubics-grid" className="stats-ubics-grid">
          {productStats.ubicaciones.length === 0 ? (
            <div className="stats-no-data">Sin ubicaciones</div>
          ) : (
            productStats.ubicaciones.map((id, i) => (
              <span key={i} className="stats-ubic-tag">{id}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
