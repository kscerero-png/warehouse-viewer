import StatusDonut from './StatusDonut';
import TopProducts from './TopProducts';

export default function RightPanel() {
  return (
    <div
      style={{
        width: 220,
        background: '#1e1e2e',
        borderLeft: '1px solid #333',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusDonut />
      <TopProducts />
    </div>
  );
}
