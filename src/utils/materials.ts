import * as THREE from 'three';
import type { RackUserData } from '../types';

const greyMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.1 });

export function getRackMaterial(userData: RackUserData | null, baseColor?: string): THREE.MeshStandardMaterial {
  if (!userData || !userData.estado) return greyMat;
  const estado = userData.estado.toLowerCase();
  if (estado === 'retenido') return retenidoMat;
  if (estado === 'rechazado') return rechazadoMat;
  if (baseColor) return new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.6, metalness: 0.1 });
  return okMat;
}

const okMat = new THREE.MeshStandardMaterial({
  color: 0x4caf50,
  roughness: 0.5,
  metalness: 0.1,
});

const retenidoMat = new THREE.MeshStandardMaterial({
  color: 0xff9800,
  roughness: 0.5,
  metalness: 0.1,
});

const rechazadoMat = new THREE.MeshStandardMaterial({
  color: 0xf44336,
  roughness: 0.5,
  metalness: 0.1,
});

const selectedMat = new THREE.MeshStandardMaterial({
  color: 0x42a5f5,
  roughness: 0.3,
  metalness: 0.2,
  emissive: 0x1565c0,
  emissiveIntensity: 0.15,
});
