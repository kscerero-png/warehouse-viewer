import type { InventoryEntry } from '../types';
import { getEffectivePositions } from './capacity';

export function calculateAllZonesMetrics(entries: InventoryEntry[], rackCounts: Record<string, number>): Record<string, { total: number; used: number; empty: number; percent: number }> {
  const result: Record<string, any> = {};

  // T, A, P, S: computeFromInventario (effective positions)
  for (const zone of ['T', 'A', 'P', 'S']) {
    const test = zone === 'T' ? /^T\d{2}$/
      : zone === 'A' ? /^A\d{3}$/
      : zone === 'P' ? /^P\d{2}$/
      : /^SQ\d{2}$/;
    let total = 0, used = 0;
    entries.forEach((e) => {
      if (!test.test(e.id)) return;
      const p = parseInt(String(e.paletas)) || 0;
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

  // Digit zones 1-9: physical rack counts
  for (let d = 1; d <= 9; d++) {
    const key = String(d);
    const total = rackCounts[key] || 0;
    const usedIds = new Set<string>();
    entries.forEach((e) => {
      if (e.id[0] === key && ((parseInt(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0)) {
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
    if (digits.includes(e.id[0]) && ((parseInt(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0)) {
      usedIds.add(e.id);
    }
  });
  const used = usedIds.size;
  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}
