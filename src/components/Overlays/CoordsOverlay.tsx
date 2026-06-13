import { useState, useEffect } from 'react';
import { useStore } from '../../store';

export default function CoordsOverlay() {
  const selectedRackId = useStore((s) => s.selectedRackId);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div id="coords-overlay" className={collapsed ? 'collapsed' : ''}>
      <div className="overlay-header">
        <span>Coordenadas</span>
        <span className="btn-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '[+]' : '[─]'}
        </span>
      </div>
      <div className="overlay-body">
        <div className="coord-row"><span className="coord-label">Cámara</span><span className="coord-value" id="coords-camera">--</span></div>
        <div className="coord-row"><span className="coord-label">Target</span><span className="coord-value" id="coords-target">--</span></div>
        {selectedRackId && (
          <div className="coord-row"><span className="coord-label">Selección</span><span className="coord-value" id="coords-pallet">{selectedRackId}</span></div>
        )}
      </div>
    </div>
  );
}
