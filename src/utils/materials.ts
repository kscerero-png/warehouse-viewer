import * as THREE from 'three';
import type { RackUserData } from '../types';

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

export function getRackMaterial(userData: RackUserData | null, baseColor?: string): THREE.MeshStandardMaterial {
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
