import { useEffect, useRef, useCallback } from 'react';
import { SceneManager } from './SceneManager';
import { useStore } from '../../store';
import { getEntriesForId } from '../../utils/inventoryUtils';
import { computeProductStats } from '../../utils/metrics';

interface Props {
  modelUrl: string;
}

export default function ThreeCanvas({ modelUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);

  const setInventario = useStore((s) => s.setInventario);
  const datosInventario = useStore((s) => s.datosInventario);
  const setSelectedRack = useStore((s) => s.setSelectedRack);
  const setProductStats = useStore((s) => s.setProductStats);
  const setHoveredMeshId = useStore((s) => s.setHoveredMeshId);
  const pasilloSeleccionado = useStore((s) => s.pasilloSeleccionado);
  const currentStatusFilter = useStore((s) => s.currentStatusFilter);
  const searchQuery = useStore((s) => s.searchQuery);

  const handleMeshClick = useCallback((entries: any[]) => {
    setSelectedRack(entries, entries[0]?.id || null);
  }, [setSelectedRack]);

  const handleMeshLongPress = useCallback((entries: any[], productName: string, codigo: string) => {
    setSelectedRack(entries, entries[0]?.id || null);
    const stats = computeProductStats(productName, codigo, useStore.getState().datosInventario);
    if (stats) setProductStats(stats);
  }, [setSelectedRack, setProductStats]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scene = new SceneManager(el);
    sceneRef.current = scene;
    scene.onMeshClick = handleMeshClick;
    scene.onMeshLongPress = handleMeshLongPress;
    scene.onMeshHover = (id) => setHoveredMeshId(id);
    scene.onModelLoaded = () => {
      const data = useStore.getState().datosInventario;
      if (data.length > 0) {
        scene.updateSceneFromInventario(data);
      }
    };

    scene.loadModel(modelUrl);

    return () => scene.dispose();
  }, [modelUrl, handleMeshClick, handleMeshLongPress, setHoveredMeshId]);

  // Sync store → scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !scene.modelReady) return;
    scene.datosInventario = datosInventario;
    scene.pasilloSeleccionado = pasilloSeleccionado;
    scene.currentSearchTerm = searchQuery;
    scene.currentStatusFilter = currentStatusFilter;
    scene.updateSceneFromInventario(datosInventario);
  }, [datosInventario, pasilloSeleccionado, searchQuery, currentStatusFilter]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
}
