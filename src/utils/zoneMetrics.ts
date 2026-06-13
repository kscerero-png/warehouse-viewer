import type { InventoryEntry } from '../types';

export function calculateAllZonesMetrics(entries: InventoryEntry[]): Record<string, { total: number; used: number; empty: number; percent: number }> {
  const zones: Record<string, InventoryEntry[]> = {};
  entries.forEach((e) => {
    const key = getZoneKey(e.id);
    if (!key) return;
    if (!zones[key]) zones[key] = [];
    zones[key].push(e);
  });
  const result: Record<string, any> = {};
  for (const [key, zone] of Object.entries(zones)) {
    const total = zone.length;
    const used = zone.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
    result[key] = { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
  }
  result['1-4'] = calculateGroup(entries, ['1', '2', '3', '4']);
  result['5-9'] = calculateGroup(entries, ['5', '6', '7', '8', '9']);
  return result;
}

function calculateGroup(data: InventoryEntry[], digits: string[]) {
  const zone = data.filter((e) => digits.includes(e.id[0]));
  const total = zone.length;
  const used = zone.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
  return { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
}

function getZoneKey(id: string): string | null {
  if (/^[1-9]/.test(id)) return id[0];
  if (/^T\d{2}$/.test(id)) return 'T';
  if (/^A\d{3}$/.test(id)) return 'A';
  if (/^P\d{2}$/.test(id)) return 'P';
  if (/^SQ\d{2}$/.test(id)) return 'S';
  return null;
}
