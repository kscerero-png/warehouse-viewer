export function isTransitId(id: string): boolean {
  return /^T\d{2}$/.test(id);
}

export function isFormulacionId(id: string): boolean {
  return /^A\d{3}$/.test(id);
}

export function isGalponAnexoId(id: string): boolean {
  return /^P\d{2}$/.test(id);
}

export function isJaulaId(id: string): boolean {
  return /^SQ\d{2}$/.test(id);
}

export function isRackId(id: string): boolean {
  return /^[1-9]/.test(id) || isTransitId(id) || isFormulacionId(id) || isGalponAnexoId(id) || isJaulaId(id);
}

export function isSubPaletaName(name: string): boolean {
  return /^(T\d{2}|A\d{3}|P\d{2}|SQ\d{2})-\d+$/.test(name);
}

export function isFiveDigitId(id: string): boolean {
  return /^\d{5}$/.test(id);
}

export function isFrontFacingLocation(id: string): boolean {
  const pasillo = id[0];
  const col = parseInt(id[3], 10);
  if (pasillo === '5') return col <= 8;
  if (pasillo >= '6' && pasillo <= '8') return col <= 6;
  return col <= 15;
}

import * as THREE from 'three';

export function getFrontDirectionFromId(id: string): THREE.Vector3 | null {
  if (!id || !/^\d{5}$/.test(id)) return null;
  const col = parseInt(id[3], 10);
  const pasillo = id[0];
  if (pasillo === '1' || pasillo === '2') return new THREE.Vector3(0, 0, col <= 1 ? 1 : -1);
  if (pasillo === '3') return new THREE.Vector3(0, 0, col <= 1 ? -1 : 1);
  if (pasillo === '5' || pasillo === '6') return new THREE.Vector3(0, 0, col <= 2 ? 1 : -1);
  if (pasillo === '7' || pasillo === '8') return new THREE.Vector3(0, 0, col <= 2 ? -1 : 1);
  if (pasillo === '9') return new THREE.Vector3(0, 0, col <= 2 ? 1 : -1);
  if (pasillo === '4') return new THREE.Vector3(0, 0, col <= 2 ? -1 : 1);
  return null;
}

export function getAisleGroupLabel(aisle: string): string {
  if (aisle === 'T' || aisle === 't') return 'Tránsito';
  if (aisle === 'A' || aisle === 'a') return 'Formulación';
  if (aisle === 'P' || aisle === 'p') return 'Galpón Anexo';
  if (aisle === 'S' || aisle === 's') return 'Jaula';
  const d = parseInt(aisle, 10);
  if (d >= 1 && d <= 4) return 'Almacén Principal';
  if (d >= 5 && d <= 9) return 'CAVA';
  return 'General';
}

export function normalizeLocationId(id: string): string | null {
  if (!id || typeof id !== 'string') return null;
  id = id.trim().toUpperCase();
  if (/^\d{5}$/.test(id)) return id;
  const m = id.match(/(\d{5})/);
  return m ? m[1] : (isRackId(id) ? id : null);
}
