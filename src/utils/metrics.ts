import type { InventoryEntry, StatusBreakdown, ProductCount, ProductStats } from '../types';

export function calculateZoneMetrics(entries: InventoryEntry[], zoneFilter: (id: string) => boolean): { total: number; used: number; empty: number; percent: number } {
  const zone = entries.filter((e) => zoneFilter(e.id));
  const total = zone.length;
  const used = zone.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}

export function calculateStatusBreakdown(entries: InventoryEntry[], zoneFilter?: (id: string) => boolean): StatusBreakdown {
  const zone = zoneFilter ? entries.filter((e) => zoneFilter(e.id)) : entries;
  const total = zone.length || 1;
  // Count occupied entries (paletas > 0 OR cantidad > 0), grouped by estado
  const ret = zone.filter((e) => {
    const ocupado = (parseInt(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0;
    return (e.estado || '').toLowerCase() === 'retenido' && ocupado;
  }).length;
  const rej = zone.filter((e) => {
    const ocupado = (parseInt(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0;
    return (e.estado || '').toLowerCase() === 'rechazado' && ocupado;
  }).length;
  const lib = zone.filter((e) => {
    const ocupado = (parseInt(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0;
    const estado = (e.estado || '').toLowerCase();
    return (estado === 'liberado' || estado === '') && ocupado;
  }).length;
  // vacío = total entries - occupied ones (mutually exclusive)
  const vacio = total - ret - rej - lib;
  return {
    retenido: ret,
    rechazado: rej,
    liberado: lib,
    vacio: Math.max(0, vacio),
    pctRetenido: Math.round((ret / total) * 100),
    pctRechazado: Math.round((rej / total) * 100),
    pctLiberado: Math.round((lib / total) * 100),
    pctVacio: Math.round((Math.max(0, vacio) / total) * 100),
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

export function computeProductStats(productName: string, codigoRef: string | undefined, data: InventoryEntry[]): ProductStats | null {
  const term = (productName || codigoRef || '').toLowerCase().trim();
  if (!term) return null;

  const matchingRows = data.filter((item) => {
    const prod = (item.producto || '').toLowerCase();
    const cod = (item.codigo || '').toLowerCase();
    return prod === term || cod === term || prod.includes(term) || cod.includes(term);
  });

  if (matchingRows.length === 0) return null;

  const canonName = matchingRows[0].producto || productName || '-';
  const canonCod = matchingRows[0].codigo || codigoRef || '-';

  const ubicSet = new Set<string>();
  matchingRows.forEach((r) => { if (r.id && String(r.id).trim()) ubicSet.add(String(r.id).trim()); });

  let totalQty = 0;
  matchingRows.forEach((r) => {
    const v = parseFloat(String(r.cantidad));
    if (!isNaN(v)) totalQty += v;
  });

  const lotesMap: Record<string, { qty: number; ubics: Set<string> }> = {};
  matchingRows.forEach((r) => {
    const lote = (r.lote || 'Sin lote').trim();
    const id = (r.id || '').trim();
    const qty = parseFloat(String(r.cantidad)) || 0;
    if (!lotesMap[lote]) lotesMap[lote] = { qty: 0, ubics: new Set() };
    lotesMap[lote].qty += qty;
    if (id) lotesMap[lote].ubics.add(id);
  });

  const lotes = Object.entries(lotesMap)
    .map(([name, data]) => ({ name, qty: data.qty, ubics: [...data.ubics] }))
    .sort((a, b) => b.qty - a.qty);

  const umCount: Record<string, number> = {};
  matchingRows.forEach((r) => {
    const um = (r.um || '').trim();
    if (um) umCount[um] = (umCount[um] || 0) + 1;
  });
  const canonUm = Object.entries(umCount).sort((a, b) => b[1] - a[1]).map((e) => e[0])[0] || '';

  return { canonName, canonCod, totalUbics: ubicSet.size, totalQty, lotes, ubicaciones: [...ubicSet].sort(), canonUm };
}
