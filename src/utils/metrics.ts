import type { InventoryEntry, StatusBreakdown, ProductCount, ProductStats } from '../types';

export function calculateZoneMetrics(entries: InventoryEntry[], zoneFilter: (id: string) => boolean): { total: number; used: number; empty: number; percent: number } {
  const zone = entries.filter((e) => zoneFilter(e.id));
  const total = zone.length;
  const used = zone.filter((e) => (parseFloat(String(e.paletas)) || 0) > 0).length;
  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}

export function calculateStatusBreakdown(
  entries: InventoryEntry[],
  zoneFilter: ((id: string) => boolean) | undefined,
  totalRacks: number,
  pasillo: string,
): StatusBreakdown {
  const zone = zoneFilter ? entries.filter((e) => zoneFilter(e.id)) : entries;
  const isCapacityZone = pasillo === 'T' || pasillo === 'P';

  if (isCapacityZone) {
    // T, P: count paletas by estado, total = effective positions (matches zoneMetrics)
    let ret = 0, rej = 0, lib = 0;
    for (const e of zone) {
      const p = parseFloat(String(e.paletas)) || 0;
      const ocupado = p > 0 || (parseFloat(String(e.cantidad)) || 0) > 0;
      if (!ocupado) continue;
      const estado = (e.estado || 'liberado').toLowerCase();
      const count = p > 0 ? p : 1;
      if (estado === 'retenido') ret += count;
      else if (estado === 'rechazado') rej += count;
      else lib += count;
    }
    const vacio = totalRacks - ret - rej - lib;
    const total = totalRacks || 1;
    return {
      retenido: ret, rechazado: rej, liberado: lib, vacio: Math.max(0, vacio),
      pctRetenido: Math.round((ret / total) * 100),
      pctRechazado: Math.round((rej / total) * 100),
      pctLiberado: Math.round((lib / total) * 100),
      pctVacio: Math.round((Math.max(0, vacio) / total) * 100),
    };
  }

  if (pasillo === 'A' || pasillo === 'S') {
    // A, S: each parent rack has 2 sub-positions
    // Occupied = sum of paletas per parent, capped at 2
    // Estado assigned via accumulator crossing thresholds 1.0 and 2.0
    const parentMap: Record<string, InventoryEntry[]> = {};
    for (const e of zone) {
      if (!parentMap[e.id]) parentMap[e.id] = [];
      parentMap[e.id].push(e);
    }

    const totalSubPositions = totalRacks;
    let occupiedCount = 0, ret = 0, rej = 0, lib = 0;

    for (const entries of Object.values(parentMap)) {
      let acc = 0;
      for (const e of entries) {
        if (occupiedCount >= 2) break;
        const p = parseFloat(String(e.paletas)) || 0;
        if (p <= 0) continue;
        const newAcc = acc + p;
        const estado = (e.estado || 'liberado').toLowerCase();
        if (acc < 1 && newAcc >= 1) {
          if (estado === 'retenido') ret++; else if (estado === 'rechazado') rej++; else lib++;
          occupiedCount++;
        }
        if (occupiedCount < 2 && acc < 2 && newAcc >= 2) {
          if (estado === 'retenido') ret++; else if (estado === 'rechazado') rej++; else lib++;
          occupiedCount++;
        }
        acc = newAcc;
      }
    }

    const vacio = totalSubPositions - occupiedCount;
    const total = totalSubPositions || 1;
    return {
      retenido: ret, rechazado: rej, liberado: lib, vacio: Math.max(0, vacio),
      pctRetenido: Math.round((ret / total) * 100),
      pctRechazado: Math.round((rej / total) * 100),
      pctLiberado: Math.round((lib / total) * 100),
      pctVacio: Math.round((Math.max(0, vacio) / total) * 100),
    };
  }

  // Digit zones (1-9) and 'todos': rack-level counting (unique IDs)
  const rackStatus: Record<string, string> = {};
  const rackOccupied = new Set<string>();
  for (const e of zone) {
    const ocupado = (parseFloat(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0;
    if (!ocupado) continue;
    rackOccupied.add(e.id);

    const estado = (e.estado || 'liberado').toLowerCase();
    const current = rackStatus[e.id];
    if (!current) {
      rackStatus[e.id] = estado;
    } else if (current === 'liberado' && (estado === 'retenido' || estado === 'rechazado')) {
      rackStatus[e.id] = estado;
    } else if (current === 'rechazado' && estado === 'retenido') {
      rackStatus[e.id] = estado;
    }
  }

  const occupiedRacks = rackOccupied.size;
  const ret = Object.values(rackStatus).filter((v) => v === 'retenido').length;
  const rej = Object.values(rackStatus).filter((v) => v === 'rechazado').length;
  const lib = Object.values(rackStatus).filter((v) => v === 'liberado').length;
  const vacio = totalRacks - occupiedRacks;
  const total = totalRacks || 1;
  return {
    retenido: ret, rechazado: rej, liberado: lib, vacio: Math.max(0, vacio),
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
    map[prod] = (map[prod] || 0) + (parseFloat(String(e.paletas)) || 0);
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
