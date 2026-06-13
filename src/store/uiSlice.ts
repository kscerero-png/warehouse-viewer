import type { Pasillo, StatusFilter } from '../types';

export interface UiState {
  pasilloSeleccionado: Pasillo;
  currentStatusFilter: StatusFilter;
  searchQuery: string;
  showInfoPanel: boolean;
  showStatsPanel: boolean;
  showZoneOccupancy: boolean;
  setPasillo: (p: Pasillo) => void;
  setStatusFilter: (f: StatusFilter) => void;
  setSearchQuery: (q: string) => void;
  toggleInfoPanel: () => void;
  toggleStatsPanel: () => void;
  toggleZoneOccupancy: () => void;
}

export const createUiSlice = (
  set: (fn: (state: any) => Partial<UiState>) => void
): UiState => ({
  pasilloSeleccionado: 'todos',
  currentStatusFilter: null,
  searchQuery: '',
  showInfoPanel: false,
  showStatsPanel: false,
  showZoneOccupancy: false,

  setPasillo: (p: Pasillo) => set((s: any) => ({ ...s, pasilloSeleccionado: p })),
  setStatusFilter: (f: StatusFilter) => set((s: any) => ({ ...s, currentStatusFilter: f })),
  setSearchQuery: (q: string) => set((s: any) => ({ ...s, searchQuery: q })),
  toggleInfoPanel: () => set((s: any) => ({ ...s, showInfoPanel: !s.showInfoPanel })),
  toggleStatsPanel: () => set((s: any) => ({ ...s, showStatsPanel: !s.showStatsPanel })),
  toggleZoneOccupancy: () => set((s: any) => ({ ...s, showZoneOccupancy: !s.showZoneOccupancy })),
});
