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
