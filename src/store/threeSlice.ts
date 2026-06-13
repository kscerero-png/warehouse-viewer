import type { RackUserData } from '../types';

export interface ThreeState {
  selectedMesh: RackUserData | null;
  hoveredMeshId: string | null;
  highlightMap: Record<string, string>;
  setSelectedMesh: (data: RackUserData | null) => void;
  setHoveredMeshId: (id: string | null) => void;
  setHighlightMap: (map: Record<string, string>) => void;
}

export const createThreeSlice = (
  set: (fn: (state: any) => Partial<ThreeState>) => void
): ThreeState => ({
  selectedMesh: null,
  hoveredMeshId: null,
  highlightMap: {},

  setSelectedMesh: (data: RackUserData | null) => set((s: any) => ({ ...s, selectedMesh: data })),
  setHoveredMeshId: (id: string | null) => set((s: any) => ({ ...s, hoveredMeshId: id })),
  setHighlightMap: (map: Record<string, string>) => set((s: any) => ({ ...s, highlightMap: map })),
});
