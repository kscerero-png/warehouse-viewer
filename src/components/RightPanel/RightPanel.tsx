import StatusDonut from './StatusDonut';
import TopProducts from './TopProducts';
import StatusSummaryPanel from './StatusSummaryPanel';
import ZoneProductSummary from './ZoneProductSummary';

export default function RightPanel() {
  return (
    <div id="right-panel">
      <StatusDonut />
      <div className="filter-badge-row" id="usage-status-breakdown">
        <span
          className="filter-badge"
          id="usage-status-clear"
          style={{ display: 'none' }}
        >
          ✕ Limpiar
        </span>
      </div>
      <TopProducts />
      <ZoneProductSummary />
      <StatusSummaryPanel />
    </div>
  );
}
