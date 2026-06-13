import { useStore } from '../../store';

export default function StatsPanel() {
  const showStatsPanel = useStore((s) => s.showStatsPanel);

  if (!showStatsPanel) return null;

  const datosInventario = useStore((s) => s.datosInventario);
  const total = datosInventario.length;
  const used = datosInventario.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;

  return (
    <div
      style={{
        position: 'absolute',
        right: 260,
        top: 16,
        background: '#1e1e2e',
        border: '1px solid #444',
        borderRadius: 8,
        padding: 12,
        minWidth: 180,
        zIndex: 60,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Estadísticas</div>
      <div style={{ fontSize: 12, color: '#ccc', marginBottom: 4 }}>Total: {total}</div>
      <div style={{ fontSize: 12, color: '#ccc', marginBottom: 4 }}>Ocupadas: {used}</div>
      <div style={{ fontSize: 12, color: '#ccc' }}>Vacías: {total - used}</div>
    </div>
  );
}
