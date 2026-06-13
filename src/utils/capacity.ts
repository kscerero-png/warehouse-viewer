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

export function calculateCapacityUsageForAisle(aisle: string, data: InventoryEntry[]): { total: number; used: number; empty: number; percent: number } {
  const filtered = data.filter((e) => {
    if (aisle === 'T') return /^T\d{2}$/.test(e.id);
    if (aisle === 'A') return /^A\d{3}$/.test(e.id);
    if (aisle === 'P') return /^P\d{2}$/.test(e.id);
    if (aisle === 'S') return /^SQ\d{2}$/.test(e.id);
    return e.id[0] === aisle;
  });
  const total = filtered.length;
  const used = filtered.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}

export function calculateCapacityUsageForAisleGroup(digits: string[], data: InventoryEntry[]): { total: number; used: number; empty: number; percent: number } {
  const filtered = data.filter((e) => digits.includes(e.id[0]));
  const total = filtered.length;
  const used = filtered.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}
