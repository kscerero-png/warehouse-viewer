import type { InventoryEntry, RackUserData } from '../types';

export function getEffectivePositions(entry: InventoryEntry): number {
  const p = parseInt(String(entry.paletas)) || 0;
  const n = parseInt(String(entry.nivel)) || 0;
  if (n >= 4 || n <= 0) return p;
  if (p <= 0) return 0;
  const groups = Math.floor(p / n);
  const rem = p % n;
  return groups * 4 + rem;
}

export function isSlotVisible(idx: number, nivel: number | string | undefined): boolean {
  const n = parseInt(String(nivel)) || 0;
  if (n >= 4 || n <= 0) return true;
  const mod = idx % 4;
  return (mod === 0 ? 4 : mod) <= n;
}

export function getCapacityForObj(obj: RackUserData): { total: number; used: number } {
  const entries = obj.entries || (obj.cantidad ? [obj as InventoryEntry] : []);
  let total = entries.length;
  let used = 0;
  entries.forEach((e: InventoryEntry) => {
    const p = parseInt(String(e.paletas)) || 0;
    if (p > 0) {
      const ep = getEffectivePositions(e);
      total = Math.max(total, ep);
      used += p;
    } else if (e.cantidad && e.cantidad > 0) {
      used += 1;
      total = Math.max(total, 1);
    }
  });
  return { total, used };
}

export function calculateCapacityUsageForAisle(aisle: string, data: InventoryEntry[], rackCounts: Record<string, number>): { total: number; used: number; empty: number; percent: number } {
  let total = 0, used = 0;

  if (aisle === 'T' || aisle === 'A' || aisle === 'P' || aisle === 'S') {
    const test = aisle === 'T' ? /^T\d{2}$/
      : aisle === 'A' ? /^A\d{3}$/
      : aisle === 'P' ? /^P\d{2}$/
      : /^SQ\d{2}$/;
    data.forEach((e) => {
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
  } else {
    total = rackCounts[aisle] || 0;
    const usedIds = new Set<string>();
    data.forEach((e) => {
      if (e.id[0] === aisle && ((parseInt(String(e.paletas)) || 0) > 0 || (parseFloat(String(e.cantidad)) || 0) > 0)) {
        usedIds.add(e.id);
      }
    });
    used = usedIds.size;
  }

  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}

export function calculateCapacityUsageForAisleGroup(digits: string[], data: InventoryEntry[], rackCounts: Record<string, number>): { total: number; used: number; empty: number; percent: number } {
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
