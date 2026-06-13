import { useEffect, useRef, useCallback } from 'react';
import { SceneManager } from './SceneManager';

interface Props {
  modelUrl: string;
  onSceneReady?: (scene: SceneManager) => void;
}

export default function ThreeCanvas({ modelUrl, onSceneReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const scene = new SceneManager(el);
    sceneRef.current = scene;
    scene.loadModel(modelUrl).then(() => {
      onSceneReady?.(scene);
    });
    return () => scene.dispose();
  }, [modelUrl, onSceneReady]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
}
