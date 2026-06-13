import { useState } from 'react';

export default function ControlsLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div id="controls-legend" className={collapsed ? 'collapsed' : ''}>
      <div className="overlay-header">
        <span>Controles</span>
        <span className="btn-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '[+]' : '[─]'}
        </span>
      </div>
      <div className="overlay-body">
        <div className="control-row"><kbd>Click</kbd> <span>Inspeccionar</span></div>
        <div className="control-row"><kbd>Arrastrar</kbd> <span>Rotar</span></div>
        <div className="control-row"><kbd>Scroll</kbd> <span>Zoom</span></div>
        <div className="control-row"><kbd>Click Der.</kbd> <span>Panear</span></div>
      </div>
    </div>
  );
}
