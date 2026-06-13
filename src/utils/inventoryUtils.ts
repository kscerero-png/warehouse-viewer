import type { InventoryEntry, RackUserData, GroupedEntry } from '../types';

export function getEntriesForId(id: string, data: InventoryEntry[]): InventoryEntry[] {
  return data.filter((item) => item.id === id);
}

export function mergeEntryState(entries: InventoryEntry[]): string {
  let estado = 'liberado';
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i].estado || 'liberado';
    if (e === 'rechazado') return 'rechazado';
    if (e === 'retenido') estado = 'retenido';
  }
  return estado;
}

export function isEmptyRack(rackData: RackUserData | InventoryEntry | null | undefined): boolean {
  if (!rackData) return true;
  if ('ocupacion' in rackData && rackData.ocupacion !== undefined) return rackData.ocupacion === 0;
  if ('cantidad' in rackData && rackData.cantidad !== undefined) return rackData.cantidad === 0;
  if ('entries' in rackData && rackData.entries) {
    return rackData.entries.every((e) => !e.cantidad || e.cantidad === 0);
  }
  return true;
}

export function countEntries(rackData: RackUserData): number {
  if (!rackData || !rackData.entries) return 0;
  return rackData.entries.length;
}

export function mergeLotes(lotes: { lote: string; cantidad: number }[]): { lote: string; cantidad: number }[] {
  const map: Record<string, { lote: string; cantidad: number }> = {};
  lotes.forEach((l) => {
    const lk = (l.lote || '-').trim() || '-';
    if (!map[lk]) map[lk] = { lote: lk, cantidad: 0 };
    map[lk].cantidad += l.cantidad;
  });
  return Object.keys(map).map((k) => map[k]);
}

export function groupEntries(entries: InventoryEntry[]): GroupedEntry[] {
  const groups: Record<string, GroupedEntry> = {};
  entries.forEach((e) => {
    const key = ((e.producto || '').trim() + '|' + (e.codigo || '').trim()) || 'unknown';
    if (!groups[key]) {
      groups[key] = { producto: (e.producto || '').trim(), codigo: (e.codigo || '').trim(), lotes: [], paletas: 0, cantidad: 0, um: e.um || '' };
    }
    groups[key].lotes.push({ lote: e.lote || '-', cantidad: parseFloat(String(e.cantidad)) || 0 });
    groups[key].paletas += parseFloat(String(e.paletas)) || 0;
    groups[key].cantidad += parseFloat(String(e.cantidad)) || 0;
  });
  return Object.values(groups).map((g) => ({ ...g, lotes: mergeLotes(g.lotes) }));
}
