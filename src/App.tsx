import { useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import KpiBar from './components/KpiBar';
import ThreeCanvas from './components/ThreeCanvas/ThreeCanvas';
import RightPanel from './components/RightPanel/RightPanel';
import InfoPanel from './components/FloatingPanels/InfoPanel';
import StatsPanel from './components/FloatingPanels/StatsPanel';
import ZoneOccupancy from './components/FloatingPanels/ZoneOccupancy';
import CoordsOverlay from './components/Overlays/CoordsOverlay';
import ControlsLegend from './components/Overlays/ControlsLegend';
import Loader from './components/Overlays/Loader';
import ResetViewButton from './components/Overlays/ResetViewButton';
import { useStore } from './store';
import { isRackId } from './utils/idHelpers';

const MODEL_URL = '/almacen.glb';
const INVENTARIO_URL = 'https://script.google.com/macros/s/AKfycbz40VVLFFkSnkSV-kll7OQRd30wGyiZGiHq1kNo5d-hn8o9lIT2hy_K53SNb8YDDH8tkw/exec';

export default function App() {
  const setInventario = useStore((s) => s.setInventario);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackName = urlParams.get('callback');

    if (callbackName) {
      (window as any)[callbackName] = (data: any) => {
        const mapped = (data.data || data).map(normalizeEntry).filter((e: any) => e.id && isRackId(e.id));
        setInventario(mapped);
      };
    } else {
      fetch('/inventario.json')
        .then((r) => r.json())
        .then((data) => {
          const mapped = data.map(normalizeEntry).filter((e: any) => e.id && isRackId(e.id));
          setInventario(mapped);
        })
        .catch(() => {
          loadJsonp(INVENTARIO_URL, 'cargarInventario');
        });

      const interval = setInterval(() => {
        loadJsonp(INVENTARIO_URL, 'cargarInventario');
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [setInventario]);

  return (
    <div id="app">
      <Sidebar />
      <KpiBar />
      <div id="main-area">
        <div id="scene-container">
          <ThreeCanvas modelUrl={MODEL_URL} />
          <InfoPanel />
          <StatsPanel />
          <ResetViewButton />
        </div>
        <RightPanel />
        <ZoneOccupancy />
        <CoordsOverlay />
        <ControlsLegend />
        <Loader visible={false} progress={0} />
      </div>
    </div>
  );
}

function normalizeEntry(raw: any) {
  if (!raw) return raw;
  return {
    id: String(raw.id || raw.ID || '').trim(),
    producto: String(raw.producto || raw.Producto || raw.PRODUCTO || '').trim(),
    codigo: String(raw.codigo || raw.Codigo || raw.CODIGO || '').trim(),
    lote: String(raw.lote || raw.Lote || raw.LOTE || '').trim(),
    cantidad: parseFloat(raw.cantidad || raw.Cantidad || raw.CANTIDAD || 0) || 0,
    um: String(raw.um || raw.UM || raw.Um || raw.Unidad || '').trim(),
    estado: normalizeEstado(raw.estado || raw.Estado || raw.ESTADO || raw.lote_estado || ''),
    paletas: parseInt(raw.paletas || raw.Paletas || raw.PALETAS || 0) || 0,
    nivel: parseInt(raw.nivel || raw.Nivel || raw.NIVEL || 0) || 0,
  };
}

function normalizeEstado(e: string): 'liberado' | 'retenido' | 'rechazado' {
  const s = String(e).trim().toUpperCase();
  if (s === 'R' || s === 'RETENIDO') return 'retenido';
  if (s === 'X' || s === 'RECHAZADO') return 'rechazado';
  return 'liberado';
}

function loadJsonp(url: string, callbackName: string) {
  const script = document.createElement('script');
  script.src = `${url}?callback=${callbackName}`;
  (window as any)[callbackName] = (data: any) => {
    const mapped = (data.data || data).map(normalizeEntry).filter((e: any) => e.id && isRackId(e.id));
    useStore.getState().setInventario(mapped);
  };
  document.body.appendChild(script);
  setTimeout(() => {
    const existing = document.querySelector(`script[src*="${callbackName}"]`);
    if (existing) existing.remove();
  }, 15000);
}
