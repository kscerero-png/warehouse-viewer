import { create } from 'zustand';
import type { InventoryEntry, Pasillo, StatusFilter, StatusBreakdown, ProductCount, ProductStats } from '../types';
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
  resetAll: () => void;

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
  rackCounts: Record<string, number>;
  setRackCounts: (counts: Record<string, number>) => void;
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
  setPasillo: (p: Pasillo) => {
    set({ pasilloSeleccionado: p });
    get().updateMetrics();
  },

  currentStatusFilter: null,
  setStatusFilter: (f: StatusFilter) => set({ currentStatusFilter: f }),

  searchQuery: '',
  setSearchQuery: (q: string) => set({ searchQuery: q }),

  selectedRack: null,
  selectedRackId: null,
  setSelectedRack: (entries, id) => set({ selectedRack: entries, selectedRackId: id, showInfoPanel: true }),
  clearSelection: () => set({ selectedRack: null, selectedRackId: null, showInfoPanel: false, showStatsPanel: false }),
  resetAll: () => set({ selectedRack: null, selectedRackId: null, showInfoPanel: false, showStatsPanel: false, pasilloSeleccionado: 'todos', searchQuery: '', currentStatusFilter: null }),

  showInfoPanel: false,
  showStatsPanel: false,
  showZoneOccupancy: true,
  toggleInfoPanel: () => set((s) => ({ showInfoPanel: !s.showInfoPanel })),
  toggleStatsPanel: () => set((s) => ({ showStatsPanel: !s.showStatsPanel })),
  toggleZoneOccupancy: () => set((s) => ({ showZoneOccupancy: !s.showZoneOccupancy })),

  productStats: null,
  setProductStats: (s) => set({ productStats: s }),

  statusBreakdown: { retenido: 0, rechazado: 0, liberado: 0, vacio: 0, pctRetenido: 0, pctRechazado: 0, pctLiberado: 0, pctVacio: 0 },
  topProducts: [],
  zoneMetrics: {},
  rackCounts: {},
  setRackCounts: (counts) => {
    set({ rackCounts: counts, zoneMetrics: calculateAllZonesMetrics(get().datosInventario, counts) });
  },
  updateMetrics: () => {
    const { datosInventario, pasilloSeleccionado, rackCounts } = get();
    const zoneFilter = pasilloSeleccionado !== 'todos'
      ? (id: string) => {
          if (pasilloSeleccionado === 'T') return /^T\d{2}$/.test(id);
          if (pasilloSeleccionado === 'A') return /^A\d{3}$/.test(id);
          if (pasilloSeleccionado === 'P') return /^P\d{2}$/.test(id);
          if (pasilloSeleccionado === 'S') return /^SQ\d{2}$/.test(id);
          return id[0] === pasilloSeleccionado;
        }
      : undefined;

    // zoneMetrics needed for T/A/S/P total calculation
    const zoneMetrics = calculateAllZonesMetrics(datosInventario, rackCounts);

    // Compute total positions based on zone type
    let totalRacks: number;
    const isCapacityZone = pasilloSeleccionado === 'T' || pasilloSeleccionado === 'P';
    const isSubPosZone = pasilloSeleccionado === 'A' || pasilloSeleccionado === 'S';
    if (pasilloSeleccionado === 'todos') {
      totalRacks = Object.values(rackCounts).reduce((a, b) => a + b, 0);
    } else if (isCapacityZone) {
      totalRacks = zoneMetrics[pasilloSeleccionado]?.total || 0;
    } else if (isSubPosZone) {
      totalRacks = (rackCounts[pasilloSeleccionado] || 0) * 2;
    } else {
      totalRacks = rackCounts[pasilloSeleccionado] || 0;
    }
    // Fallback when 3D model hasn't loaded rackCounts yet
    if (totalRacks === 0) {
      if (isSubPosZone) {
        const zone = datosInventario.filter((e) => zoneFilter ? zoneFilter(e.id) : true);
        const parents = new Set(zone.map((e) => e.id));
        totalRacks = parents.size * 2 || 1;
      } else {
        const zone = zoneFilter ? datosInventario.filter((e) => zoneFilter(e.id)) : datosInventario;
        totalRacks = zone.length || 1;
      }
    }

    const statusBreakdown = calculateStatusBreakdown(datosInventario, zoneFilter, totalRacks, pasilloSeleccionado);
    const topProducts = computeTopProducts(datosInventario);
    set({ statusBreakdown, topProducts, zoneMetrics });
  },

  hoveredMeshId: null,
  setHoveredMeshId: (id) => set({ hoveredMeshId: id }),
}));
