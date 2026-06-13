import { useStore } from '../../store';
import { groupEntries } from '../../utils/inventoryUtils';

export default function InfoPanel() {
  const showInfoPanel = useStore((s) => s.showInfoPanel);
  const selectedMesh = useStore((s) => s.selectedMesh);
  const datosInventario = useStore((s) => s.datosInventario);

  if (!showInfoPanel || !selectedMesh) return null;

  const entries = datosInventario.filter((e) => e.id === selectedMesh.id);
  const groups = groupEntries(entries);
  const hasDuplicates = groups.length > 1;
  const firstProduct = groups.length > 0 ? groups[0].producto : '';

  return (
    <div
      style={{
        position: 'absolute',
        left: 12,
        bottom: 48,
        background: '#1e1e2e',
        border: '1px solid #444',
        borderRadius: 8,
        padding: 12,
        minWidth: 200,
        maxWidth: 320,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>{selectedMesh.id}</div>
      {groups.map((g, i) => (
        <div key={i} style={{ marginBottom: i < groups.length - 1 ? 8 : 0 }}>
          {hasDuplicates && g.producto !== firstProduct && (
            <div style={{ fontSize: 12, color: '#e0e0e0', fontWeight: 600, marginBottom: 4 }}>{g.producto}</div>
          )}
          {!hasDuplicates && (
            <div style={{ fontSize: 12, color: '#e0e0e0', fontWeight: 600, marginBottom: 4 }}>{g.producto}</div>
          )}
          <div style={{ fontSize: 11, color: '#aaa' }}>Código: {g.codigo}</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>Lotes: {g.lotes.map((l) => l.lote).join(', ')}</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>Paletas: {g.paletas}</div>
        </div>
      ))}
    </div>
  );
}
