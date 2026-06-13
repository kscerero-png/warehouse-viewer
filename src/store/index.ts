import { create } from 'zustand';
import type { InventoryEntry, Pasillo, StatusFilter, RackUserData, StatusBreakdown, ProductCount, ProductStats } from '../types';
import { calculateStatusBreakdown, computeTopProducts, computeProductStats } from '../utils/metrics';
import { calculateAllZonesMetrics } from '../utils/zoneMetrics';

export interface AppStore {
  datosInventario: InventoryEntry[];
  setInventario: (data: InventoryEntry[]) => void;

  pasilloSeleccionado: Pasillo;
  setPasillo: (p: Pasillo) => void;

  currentStatusFilter: StatusFilter;
  setStatusFilter: (f: StatusFilter) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  selectedRack: InventoryEntry[] | null;
  selectedRackId: string | null;
  setSelectedRack: (entries: InventoryEntry[] | null, id: string | null) => void;
  clearSelection: () => void;

  showInfoPanel: boolean;
  showStatsPanel: boolean;
  showZoneOccupancy: boolean;
  toggleInfoPanel: () => void;
  toggleStatsPanel: () => void;
  toggleZoneOccupancy: () => void;

  productStats: ProductStats | null;
  setProductStats: (s: ProductStats | null) => void;

  statusBreakdown: StatusBreakdown;
  topProducts: ProductCount[];
  zoneMetrics: Record<string, any>;
  updateMetrics: () => void;

  hoveredMeshId: string | null;
  setHoveredMeshId: (id: string | null) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  datosInventario: [],
  setInventario: (data: InventoryEntry[]) => {
    set({ datosInventario: data });
    get().updateMetrics();
  },

  pasilloSeleccionado: 'todos',
  setPasillo: (p: Pasillo) => set({ pasilloSeleccionado: p }),

  currentStatusFilter: null,
  setStatusFilter: (f: StatusFilter) => set({ currentStatusFilter: f }),

  searchQuery: '',
  setSearchQuery: (q: string) => set({ searchQuery: q }),

  selectedRack: null,
  selectedRackId: null,
  setSelectedRack: (entries, id) => set({ selectedRack: entries, selectedRackId: id, showInfoPanel: true }),
  clearSelection: () => set({ selectedRack: null, selectedRackId: null, showInfoPanel: false, showStatsPanel: false }),

  showInfoPanel: false,
  showStatsPanel: false,
  showZoneOccupancy: true,
  toggleInfoPanel: () => set((s) => ({ showInfoPanel: !s.showInfoPanel })),
  toggleStatsPanel: () => set((s) => ({ showStatsPanel: !s.showStatsPanel })),
  toggleZoneOccupancy: () => set((s) => ({ showZoneOccupancy: !s.showZoneOccupancy })),

  productStats: null,
  setProductStats: (s) => set({ productStats: s }),

  statusBreakdown: { retenido: 0, rechazado: 0, liberado: 0, pctRetenido: 0, pctRechazado: 0 },
  topProducts: [],
  zoneMetrics: {},
  updateMetrics: () => {
    const { datosInventario, pasilloSeleccionado } = get();
    const zoneFilter = pasilloSeleccionado !== 'todos'
      ? (id: string) => {
          if (pasilloSeleccionado === 'T') return /^T\d{2}$/.test(id);
          if (pasilloSeleccionado === 'A') return /^A\d{3}$/.test(id);
          if (pasilloSeleccionado === 'P') return /^P\d{2}$/.test(id);
          if (pasilloSeleccionado === 'S') return /^SQ\d{2}$/.test(id);
          return id[0] === pasilloSeleccionado;
        }
      : undefined;
    const statusBreakdown = calculateStatusBreakdown(datosInventario, zoneFilter);
    const topProducts = computeTopProducts(datosInventario);
    const zoneMetrics = calculateAllZonesMetrics(datosInventario);
    set({ statusBreakdown, topProducts, zoneMetrics });
  },

  hoveredMeshId: null,
  setHoveredMeshId: (id) => set({ hoveredMeshId: id }),
}));
