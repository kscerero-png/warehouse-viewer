export interface InventoryEntry {
  id: string;
  producto: string;
  codigo: string;
  lote: string;
  cantidad: number;
  um: string;
  estado: 'liberado' | 'retenido' | 'rechazado';
  paletas?: number;
  nivel?: number;
  ocupacion?: number;
  nomenclatura?: string;
  grupo?: string;
}

export interface RackUserData {
  id: string;
  producto?: string;
  codigo?: string;
  lote?: string;
  cantidad?: number;
  um?: string;
  estado?: string;
  paletas?: number;
  nivel?: number;
  entries?: InventoryEntry[];
  subPaleta?: boolean;
  hiddenByPaletas?: boolean;
  jaula?: boolean;
  _paletaSpreadDone?: boolean;
  _showStats?: boolean;
}

export interface GroupedEntry {
  producto: string;
  codigo: string;
  lotes: { lote: string; cantidad: number }[];
  paletas: number;
  cantidad: number;
  um: string;
}

export type Pasillo = 'todos' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'A' | 'P' | 'S';
export type StatusFilter = 'liberado' | 'retenido' | 'rechazado' | null;

export interface ProductCount {
  name: string;
  count: number;
}

export interface ZoneMetrics {
  total: number;
  used: number;
  empty: number;
  percent: number;
}

export interface StatusBreakdown {
  retenido: number;
  rechazado: number;
  liberado: number;
  vacio: number;
  pctRetenido: number;
  pctRechazado: number;
  pctLiberado: number;
  pctVacio: number;
}

export interface ProductStats {
  canonName: string;
  canonCod: string;
  totalUbics: number;
  totalQty: number;
  lotes: { name: string; qty: number; ubics: string[] }[];
  ubicaciones: string[];
  canonUm: string;
}
