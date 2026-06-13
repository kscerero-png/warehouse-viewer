import { useStore } from '../../store';
import { groupEntries } from '../../utils/inventoryUtils';

export default function InfoPanel() {
  const showInfoPanel = useStore((s) => s.showInfoPanel);
  const selectedRack = useStore((s) => s.selectedRack);
  const selectedRackId = useStore((s) => s.selectedRackId);
  const clearSelection = useStore((s) => s.clearSelection);

  if (!showInfoPanel || !selectedRack || selectedRack.length === 0) return null;

  const groups = groupEntries(selectedRack);
  const estado = selectedRack[0]?.estado || 'liberado';
  const estadoClass = `estado-${estado}`;

  return (
    <div className="floating-panel visible" id="info-panel" style={{
      position: 'absolute',
      left: 12,
      top: 12,
      zIndex: 100,
      minWidth: 240,
      maxWidth: 320,
    }}>
      <div className="floating-panel-header">
        <span className="floating-panel-title">
          <span className="mono" id="rack-id">{selectedRackId || '-'}</span>
        </span>
        <button className="floating-panel-close" id="info-close" onClick={clearSelection}>✕</button>
      </div>
      <div className="floating-panel-body" style={{ maxHeight: 300, overflowY: 'auto' }}>
        {groups.map((g, i) => (
          <div key={i} style={{ marginBottom: i < groups.length - 1 ? 10 : 0 }}>
            <div id="rack-prod" style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>
              {g.producto || '-'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>
              <span id="rack-cod">{g.codigo || '-'}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>
              Lote: <span id="rack-lote">{g.lotes.map((l) => l.lote).join(', ') || '-'}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>
              Cant: <span id="rack-cant">{g.cantidad}</span> <span id="rack-um">{g.um || ''}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>
              Palets: <span id="rack-paletas">{g.paletas}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>
              Nivel: <span id="rack-nivel">{selectedRack[0]?.nivel ? `${selectedRack[0].nivel} niveles` : '1 nivel'}</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 8 }}>
          <span className={`estado-badge ${estadoClass}`} id="rack-estado">
            {estado.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
