import { useMemo } from 'react';
import { useStore } from '../../store';

export default function StatusSummaryPanel() {
  const datosInventario = useStore((s) => s.datosInventario);
  const currentStatusFilter = useStore((s) => s.currentStatusFilter);

  const summary = useMemo(() => {
    if (!currentStatusFilter || currentStatusFilter === 'liberado') return null;

    const productCounts: Record<string, number> = {};
    datosInventario.forEach((e) => {
      if ((e.estado || '').toLowerCase() === currentStatusFilter) {
        const pName = e.producto || 'Sin nombre';
        const p = parseInt(String(e.paletas)) || 0;
        productCounts[pName] = (productCounts[pName] || 0) + (p > 0 ? p : (e.cantidad && parseInt(String(e.cantidad)) > 0 ? 1 : 0));
      }
    });

    const sorted = Object.keys(productCounts).sort();
    const total = sorted.reduce((sum, p) => sum + productCounts[p], 0);
    const color = currentStatusFilter === 'retenido' ? '#d97706' : '#dc2626';

    return { sorted, total, color, productCounts };
  }, [datosInventario, currentStatusFilter]);

  if (!summary) return null;

  return (
    <div className={`md-card status-summary-panel visible`} id="status-summary-panel">
      <div className="summary-header">
        <span className="summary-icon" style={{ background: summary.color }} />
        <span className="summary-title">{currentStatusFilter!.toUpperCase()}</span>
        <span className="summary-count">{summary.total} palets</span>
      </div>
      <div className="summary-body">
        {summary.sorted.map((p) => (
          <div key={p} className="summary-item">
            <span className="summary-item-dot" style={{ background: summary.color }} />
            <span className="summary-item-name">{p}</span>
            <span className="summary-item-qty">{summary.productCounts[p]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
