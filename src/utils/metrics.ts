import type { InventoryEntry, ZoneMetrics, StatusBreakdown, ProductCount } from '../types';
import { isTransitId, isFormulacionId, isGalponAnexoId, isJaulaId } from './idHelpers';

export function calculateZoneMetrics(entries: InventoryEntry[], zoneFilter: (id: string) => boolean): ZoneMetrics {
  const zone = entries.filter((e) => zoneFilter(e.id));
  const total = zone.length;
  const used = zone.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}

export function calculateStatusBreakdown(entries: InventoryEntry[], zoneFilter: (id: string) => boolean): StatusBreakdown {
  const zone = entries.filter((e) => zoneFilter(e.id));
  const total = zone.length || 1;
  const ret = zone.filter((e) => (e.estado || '').toLowerCase() === 'retenido').length;
  const rej = zone.filter((e) => (e.estado || '').toLowerCase() === 'rechazado').length;
  const lib = zone.filter((e) => (e.estado || '').toLowerCase() === 'liberado').length;
  return {
    retenido: ret,
    rechazado: rej,
    liberado: lib,
    pctRetenido: Math.round((ret / total) * 100),
    pctRechazado: Math.round((rej / total) * 100),
  };
}

export function computeTopProducts(entries: InventoryEntry[], limit = 10): ProductCount[] {
  const map: Record<string, number> = {};
  entries.forEach((e) => {
    const prod = (e.producto || '').trim();
    if (!prod) return;
    map[prod] = (map[prod] || 0) + (parseInt(String(e.paletas)) || 0);
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}
