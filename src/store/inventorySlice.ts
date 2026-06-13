import type { InventoryEntry, ProductCount, StatusBreakdown, ZoneMetrics } from '../types';
import { isTransitId, isFormulacionId, isGalponAnexoId, isJaulaId } from '../utils/idHelpers';
import { calculateZoneMetrics, calculateStatusBreakdown, computeTopProducts } from '../utils/metrics';
import { calculateAllZonesMetrics } from '../utils/zoneMetrics';

export interface InventoryState {
  datosInventario: InventoryEntry[];
  zoneMetrics: Record<string, ZoneMetrics>;
  statusBreakdown: StatusBreakdown;
  topProducts: ProductCount[];
  loading: boolean;
  setInventario: (data: InventoryEntry[]) => void;
  updateMetrics: () => void;
}

export const createInventorySlice = (
  set: (fn: (state: any) => Partial<InventoryState>) => void,
  get: () => any
): InventoryState => ({
  datosInventario: [],
  zoneMetrics: {},
  statusBreakdown: { retenido: 0, rechazado: 0, liberado: 0, pctRetenido: 0, pctRechazado: 0 },
  topProducts: [],
  loading: false,

  setInventario: (data: InventoryEntry[]) => {
    set((s: any) => ({ ...s, datosInventario: data }));
    get().updateMetrics();
  },

  updateMetrics: () => {
    const { datosInventario } = get();
    const allZoneIds = datosInventario.map((e: InventoryEntry) => e.id);
    const zoneMetrics = calculateAllZonesMetrics(datosInventario, allZoneIds);
    const statusBreakdown = calculateStatusBreakdown(datosInventario, () => true);
    const topProducts = computeTopProducts(datosInventario);
    set((s: any) => ({ ...s, zoneMetrics, statusBreakdown, topProducts }));
  },
});
