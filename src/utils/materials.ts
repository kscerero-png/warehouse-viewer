import * as THREE from 'three';
import type { RackUserData, InventoryEntry } from '../types';

export const greyMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.1 });

export const okMat = new THREE.MeshStandardMaterial({
  color: 0x2563eb,
  roughness: 0.5,
  metalness: 0.1,
});

export const retenidoMat = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  roughness: 0.5,
  metalness: 0.1,
});

export const rechazadoMat = new THREE.MeshStandardMaterial({
  color: 0xdc2626,
  roughness: 0.5,
  metalness: 0.1,
});

// Group color mapping based on user's provided groups
export const GROUP_COLORS: Record<string, number> = {
  QS: 0x1e3a8a,    // QUIMICO SENSITIVO - deep blue
  ALG: 0x059669,   // ALERGENO / MATERIA PRIMA - emerald
  CRR: 0x92400e,   // CORRUGADO - amber/brown
  MZ04: 0x7c3aed,  // MATERIA PRIMA - violet
  MZ80: 0xdb2777,  // MATERIA PRIMA - pink
  BCH: 0x0891b2,   // BATCHES - cyan
  PT: 0x16a34a,    // PRODUCTO TERMINADO - green
  'A&G': 0xca8a04, // ACEITES Y GRASAS - yellow
  MP: 0x6366f1,    // MATERIA PRIMA - indigo
  VAR: 0x6b7280,   // VARIOS - gray
  ME: 0x475569,    // MATERIAL DE EMPAQUE - slate
  BS: 0xdc2626,    // BICARBONATO DE SODIO - red
  LAM: 0xea580c,   // LAMINADO - orange
  'T&S': 0x9333ea, // TINTAS Y SOLVENTES - purple
  CEM: 0x64748b,   // CONSUMIBLES DE EMBALAJE - slate
  ENV: 0x0d9488,   // ENVASES - teal
  CLP: 0x7c2d12,   // COLAPSIBLES - dark amber
  PR: 0xbe123c,    // PRODUCTO SEMI-ELABORADO EN RESGUARDO - rose
};

export function getGroupColor(grupo: string | undefined): number {
  if (!grupo) return 0x444444;
  return GROUP_COLORS[grupo] || hashColor(grupo);
}

function hashColor(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate a pleasant color from hash
  const h = (hash % 360 + 360) % 360;
  return hslToHex(h, 60, 40);
}

function hslToHex(h: number, s: number, l: number): number {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return (f(0) << 16) | (f(8) << 8) | f(4);
}

export function getRackMaterial(userData: RackUserData | null, baseColor?: string, viewMode?: string, grupo?: string): THREE.MeshStandardMaterial {
  // If viewing by group and grupo is provided, use group color
  if (viewMode === 'grupo' && grupo) {
    const color = getGroupColor(grupo);
    return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  }

  if (!userData || !userData.estado) return greyMat;
  const estado = userData.estado.toLowerCase();

  if (userData.entries && userData.entries.length > 1) {
    const colors = userData.entries.map((e) => {
      const st = (e.estado || 'liberado').toLowerCase();
      if (st === 'rechazado') return 0xdc2626;
      if (st === 'retenido') return 0xd97706;
      return 0x2563eb;
    });
    return new THREE.MeshStandardMaterial({
      map: getMultiColorTexture(colors, 64, 64),
      roughness: 0.5,
      metalness: 0.1,
    });
  }

  if (estado === 'retenido') return retenidoMat;
  if (estado === 'rechazado') return rechazadoMat;
  if (baseColor) return new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.6, metalness: 0.1 });
  return okMat;
}

function getMultiColorTexture(colors: number[], w: number, h: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const bandW = w / colors.length;
  colors.forEach((c, i) => {
    ctx.fillStyle = '#' + c.toString(16).padStart(6, '0');
    ctx.fillRect(i * bandW, 0, bandW, h);
  });
  return new THREE.CanvasTexture(canvas);
}
