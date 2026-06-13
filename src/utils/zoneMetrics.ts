import type { InventoryEntry, ZoneMetrics } from '../types';

export function calculateAllZonesMetrics(
  entries: InventoryEntry[],
  _allZoneIds: string[]
): Record<string, ZoneMetrics> {
  const zones: Record<string, InventoryEntry[]> = {};
  entries.forEach((e) => {
    const id = e.id;
    const zoneKey = getZoneKey(id);
    if (!zoneKey) return;
    if (!zones[zoneKey]) zones[zoneKey] = [];
    zones[zoneKey].push(e);
  });
  const result: Record<string, ZoneMetrics> = {};
  for (const [key, zone] of Object.entries(zones)) {
    const total = zone.length;
    const used = zone.filter((e) => (parseInt(String(e.paletas)) || 0) > 0).length;
    result[key] = { total, used, empty: total - used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
  }
  return result;
}

function getZoneKey(id: string): string | null {
  if (/^[1-9]/.test(id)) return id[0];
  if (/^T\d{2}$/.test(id)) return 'T';
  if (/^A\d{3}$/.test(id)) return 'A';
  if (/^P\d{2}$/.test(id)) return 'P';
  if (/^SQ\d{2}$/.test(id)) return 'S';
  return null;
}
