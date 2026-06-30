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

const MODEL_URL = `${import.meta.env.BASE_URL}almacen.glb`;
const INVENTARIO_URL = 'https://script.google.com/macros/s/AKfycbxJthmAczBij7ilAhDQF8ylNpUEs1WreP-oTBe03xRuV6VCAF3WbM79YD6u_ZjhUuqC/exec';

export default function App() {
  const setInventario = useStore((s) => s.setInventario);

  useEffect(() => {
    cargarInventarioJsonp(INVENTARIO_URL, true);
    const interval = setInterval(() => recargarInventarioPeriodico(), 60000);
    return () => clearInterval(interval);
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
  var pal = parseFloat(raw.paletas || raw.Paletas || raw.PALETAS || 0) || 0;
  var um = String(raw.um || raw.UM || raw.Um || raw.Unidad || '').trim().toLowerCase();
  var cant = parseFloat(raw.cantidad || raw.Cantidad || raw.CANTIDAD || 0) || 0;
  if (pal === 0 && um === 'bp' && cant > 0) pal = cant / 4;
  return {
    id: String(raw.id || raw.ID || '').trim(),
    producto: String(raw.producto || raw.Producto || raw.PRODUCTO || '').trim(),
    codigo: String(raw.codigo || raw.Codigo || raw.CODIGO || '').trim(),
    lote: String(raw.lote || raw.Lote || raw.LOTE || '').trim(),
    cantidad: cant,
    um: um,
    estado: normalizeEstado(raw.estado || raw.Estado || raw.ESTADO || raw.lote_estado || ''),
    paletas: pal,
    nivel: parseFloat(raw.nivel || raw.Nivel || raw.NIVEL || 0) || 0,
    nomenclatura: String(raw.Nomenclatura || raw.nomenclatura || '').trim() || undefined,
    grupo: String(raw.Grupo || raw.grupo || '').trim() || undefined,
  };
}

function normalizeEstado(e: string): 'liberado' | 'retenido' | 'rechazado' {
  const s = String(e).trim().toUpperCase();
  if (s === 'R' || s === 'RETENIDO') return 'retenido';
  if (s === 'X' || s === 'RECHAZADO') return 'rechazado';
  return 'liberado';
}

function cargarInventarioJsonp(url: string, fallback: boolean) {
  const cb = 'jsonp_' + Date.now();
  (window as any)[cb] = (data: any) => {
    delete (window as any)[cb];
    if (Array.isArray(data)) {
      const mapped = data.map(normalizeEntry).filter((e: any) => e.id && isRackId(e.id));
      useStore.getState().setInventario(mapped);
    } else if (fallback) {
      cargarInventarioFetch();
    }
  };
  const script = document.createElement('script');
  script.src = url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=' + cb + '&_=' + Date.now();
  script.onerror = () => {
    delete (window as any)[cb];
    if (fallback) cargarInventarioFetch();
  };
  const timeout = setTimeout(() => {
    if ((window as any)[cb]) {
      delete (window as any)[cb];
      if (fallback) cargarInventarioFetch();
    }
  }, 10000);
  document.body.appendChild(script);
  setTimeout(() => script.remove(), 15000);
}

function recargarInventarioPeriodico() {
  const cb = 'jsonp_' + Date.now();
  (window as any)[cb] = (data: any) => {
    delete (window as any)[cb];
    if (Array.isArray(data)) {
      const mapped = data.map(normalizeEntry).filter((e: any) => e.id && isRackId(e.id));
      useStore.getState().setInventario(mapped);
    }
  };
  const script = document.createElement('script');
  script.src = INVENTARIO_URL + '?callback=' + cb + '&_=' + Date.now();
  script.onerror = () => { delete (window as any)[cb]; };
  setTimeout(() => { if ((window as any)[cb]) delete (window as any)[cb]; }, 10000);
  document.body.appendChild(script);
  setTimeout(() => script.remove(), 15000);
}

function cargarInventarioFetch() {
  fetch(`${import.meta.env.BASE_URL}inventario.json`)
    .then((r) => r.json())
    .then((data) => {
      const mapped = data.map(normalizeEntry).filter((e: any) => e.id && isRackId(e.id));
      useStore.getState().setInventario(mapped);
    })
    .catch(() => console.error('Error cargando inventario.json'));
}
