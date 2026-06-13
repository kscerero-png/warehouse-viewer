import type { InventoryEntry } from '../types';
import { getEffectivePositions } from './capacity';

export function calculateAllZonesMetrics(entries: InventoryEntry[], rackCounts: Record<string, number>): Record<string, { total: number; used: number; empty: number; percent: number }> {
  const result: Record<string, any> = {};

  // T, P: computeFromInventario (effective positions)
  for (const zone of ['T', 'P']) {
    const test = zone === 'T' ? /^T\d{2}$/ : /^P\d{2}$/;
    let total = 0, used = 0;
    entries.forEach((e) => {
      if (!test.test(e.id)) return;
      const p = parseFloat(String(e.paletas)) || 0;
      if (p > 0) {
        total += getEffectivePositions(e);
        used += p;
      } else if (parseFloat(String(e.cantidad)) > 0) {
        total += 1;
        used += 1;
      }
    });
    result[zone] = { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
  }

  // A, S: sub-position counting (2 per parent rack)
  for (const spec of [{ zone: 'A', test: /^A\d{3}$/ }, { zone: 'S', test: /^SQ\d{2}$/ }]) {
    const parentRacks = rackCounts[spec.zone] || 0;
    let total = parentRacks * 2;
    const parentMap: Record<string, InventoryEntry[]> = {};
    entries.forEach((e) => {
      if (!spec.test.test(e.id)) return;
      if (!parentMap[e.id]) parentMap[e.id] = [];
      parentMap[e.id].push(e);
    });
    let used = 0;
    for (const parentEntries of Object.values(parentMap)) {
      const pSum = parentEntries.reduce(
        (sum, e) => sum + (parseFloat(String(e.paletas)) || 0),
        0,
      );
      used += Math.min(pSum, 2);
    }
    // Fallback when 3D model hasn't loaded rackCounts
    if (total === 0) total = Object.keys(parentMap).length * 2 || 1;
    result[spec.zone] = { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
  }

  // Digit zones 1-9: physical rack counts
  for (let d = 1; d <= 9; d++) {
    const key = String(d);
    const total = rackCounts[key] || 0;
    const usedIds = new Set<string>();
    entries.forEach((e) => {
      if (e.id[0] === key && ((parseFloat(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0)) {
        usedIds.add(e.id);
      }
    });
    const used = usedIds.size;
    result[key] = { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
  }

  // Groups
  result['1-4'] = calcGroup(['1', '2', '3', '4'], entries, rackCounts);
  result['5-9'] = calcGroup(['5', '6', '7', '8', '9'], entries, rackCounts);

  return result;
}

function calcGroup(digits: string[], data: InventoryEntry[], rackCounts: Record<string, number>) {
  const total = digits.reduce((sum, d) => sum + (rackCounts[d] || 0), 0);
  const usedIds = new Set<string>();
  data.forEach((e) => {
    if (digits.includes(e.id[0]) && ((parseFloat(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0)) {
      usedIds.add(e.id);
    }
  });
  const used = usedIds.size;
  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}
