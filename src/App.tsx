import { useCallback } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import KpiBar from './components/KpiBar';
import ThreeCanvas from './components/ThreeCanvas/ThreeCanvas';
import RightPanel from './components/RightPanel/RightPanel';
import InfoPanel from './components/FloatingPanels/InfoPanel';
import StatsPanel from './components/FloatingPanels/StatsPanel';
import type { SceneManager } from './components/ThreeCanvas/SceneManager';

const MODEL_URL = '/almacen.glb';

export default function App() {
  const handleSceneReady = useCallback((scene: SceneManager) => {
    // Wire Three.js callbacks to store when ready
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gridTemplateRows: '72px 1fr',
        background: '#12121a',
        color: '#e0e0e0',
        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Sidebar spans full height */}
      <Sidebar />

      {/* KPI bar */}
      <KpiBar />

      {/* Main area: scene + right panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 220px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 3D scene */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <ThreeCanvas modelUrl={MODEL_URL} onSceneReady={handleSceneReady} />
          <InfoPanel />
          <StatsPanel />
        </div>

        {/* Right panel */}
        <RightPanel />
      </div>
    </div>
  );
}
