import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { RackUserData, InventoryEntry } from '../../types';
import { isTransitId, isFormulacionId, isGalponAnexoId, isJaulaId, isSubPaletaName, isFiveDigitId, isFrontFacingLocation, getFrontDirectionFromId } from '../../utils/idHelpers';
import { getRackMaterial } from '../../utils/materials';
import { getEntriesForId, mergeEntryState, isEmptyRack } from '../../utils/inventoryUtils';
import { getEffectivePositions, isSlotVisible } from '../../utils/capacity';

export class SceneManager {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private animId: number = 0;
  public meshes: Map<string, THREE.Mesh> = new Map();
  private subPaletaMeshes: Map<string, THREE.Mesh> = new Map();
  public modelReady: boolean = false;
  private meshByName: Map<string, THREE.Mesh> = new Map();
  public datosInventario: InventoryEntry[] = [];
  public currentSearchTerm: string = '';
  public pasilloSeleccionado: string = 'todos';
  public currentStatusFilter: string | null = null;
  public lastSelectedMesh: THREE.Mesh | null = null;
  private touchAction: string = '';

  public onMeshClick?: (entries: InventoryEntry[]) => void;
  public onMeshLongPress?: (entries: InventoryEntry[], productName: string, codigo: string) => void;
  public onMeshHover?: (id: string | null) => void;
  public onModelLoaded?: () => void;
  public onCoordsUpdate?: (cam: string, target: string, pallet: string) => void;
  public onLoaderUpdate?: (pct: number, show: boolean) => void;

  readonly longPressDuration = 600;
  private pressStartX = 0;
  private pressStartY = 0;
  private longPressed = false;
  private pressedObject: THREE.Mesh | null = null;
  private pressAnimId: number | null = null;
  private pressStartTime = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.touchAction = container.style.touchAction;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b11);

    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(15, 22, 35);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.touchAction = 'none';

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 120;
    this.controls.target.set(0, 8, 0);
    this.controls.maxPolarAngle = Math.PI / 2.1;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupLighting();
    this.setupEvents();
    this.startLoop();
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(10, 20, 10);
    this.scene.add(dir);
    const fill = new THREE.DirectionalLight(0x4488ff, 0.3);
    fill.position.set(-20, 0, -20);
    this.scene.add(fill);
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x362d1e, 0.6);
    this.scene.add(hemi);
  }

  private setupEvents(): void {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    canvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
    canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
    canvas.addEventListener('pointercancel', () => this.onPointerCancel());
    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private onPointerDown(event: PointerEvent): void {
    this.pressStartX = event.clientX;
    this.pressStartY = event.clientY;
    this.longPressed = false;
    const hit = this.intersect(event);
    this.pressedObject = hit ? hit.object as THREE.Mesh : null;
    if (!this.pressedObject) return;

    this.pressStartTime = performance.now();
    let loaderShown = false;

    const holdProgress = (now: number) => {
      const elapsed = now - this.pressStartTime;
      const pct = Math.min(1, elapsed / this.longPressDuration);
      if (!loaderShown && pct > 0.25) {
        loaderShown = true;
        this.onLoaderUpdate?.(0, true);
      }
      this.onLoaderUpdate?.(pct, true);
      if (pct >= 1) {
        this.longPressed = true;
        if (this.pressedObject && this.pressedObject.userData) {
          const ud = this.pressedObject.userData as RackUserData;
          const entries = ud.entries || this.datosInventario.filter((e) => e.id === ud.id);
          const productName = entries[0]?.producto || '';
          const codigo = entries[0]?.codigo || '';
          this.onMeshLongPress?.(entries, productName, codigo);
          this.focusObject(this.pressedObject!);
        }
        this.onLoaderUpdate?.(1, false);
        this.pressAnimId = null;
        return;
      }
      this.pressAnimId = requestAnimationFrame(holdProgress);
    };
    this.pressAnimId = requestAnimationFrame(holdProgress);
  }

  private onPointerUp(event: PointerEvent): void {
    if (this.pressAnimId) {
      cancelAnimationFrame(this.pressAnimId);
      this.pressAnimId = null;
    }
    this.onLoaderUpdate?.(0, false);

    if (!this.longPressed) {
      const hit = this.intersect(event);
      if (hit && hit.object.userData) {
        const ud = hit.object.userData as RackUserData;
        const entries = ud.entries || this.datosInventario.filter((e) => e.id === ud.id);
        if (entries.length > 0) {
          this.onMeshClick?.(entries);
          this.lastSelectedMesh = hit.object as THREE.Mesh;
        }
      }
    }
    this.pressedObject = null;
    this.longPressed = false;
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.pressAnimId) {
      const dx = event.clientX - this.pressStartX;
      const dy = event.clientY - this.pressStartY;
      if (dx * dx + dy * dy > 36) {
        if (this.pressAnimId) { cancelAnimationFrame(this.pressAnimId); this.pressAnimId = null; }
        this.pressedObject = null;
        this.onLoaderUpdate?.(0, false);
      }
      return;
    }
    const hit = this.intersect(event);
    this.onMeshHover?.(hit ? (hit.object.userData?.id || null) : null);
    this.renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
  }

  private onPointerCancel(): void {
    if (this.pressAnimId) { cancelAnimationFrame(this.pressAnimId); this.pressAnimId = null; }
    this.pressedObject = null;
    this.longPressed = false;
    this.onLoaderUpdate?.(0, false);
  }

  private intersect(event: PointerEvent): THREE.Intersection | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes: THREE.Object3D[] = [];
    this.meshes.forEach((m) => {
      if (m.visible && m.userData) {
        const isFaded = m.material && Array.isArray(m.material)
          ? m.material.some((mat: any) => mat.transparent && mat.opacity < 0.3)
          : (m.material as any)?.transparent && (m.material as any)?.opacity < 0.3;
        if (m.userData.jaula) return;
        if (isFaded) return;
        if (isEmptyRack(m.userData as RackUserData) && isFaded) return;
        meshes.push(m);
      }
    });
    const intersects = this.raycaster.intersectObjects(meshes, false);
    return intersects.length > 0 ? intersects[0] : null;
  }

  private startLoop(): void {
    const tick = () => {
      this.controls.update();
      this.updateCoords();
      this.renderer.render(this.scene, this.camera);
      this.animId = requestAnimationFrame(tick);
    };
    tick();
  }

  private updateCoords(): void {
    const c = this.camera.position;
    const t = this.controls.target;
    const camStr = `X:${c.x.toFixed(2)} Y:${c.y.toFixed(2)} Z:${c.z.toFixed(2)}`;
    const tgtStr = `X:${t.x.toFixed(2)} Y:${t.y.toFixed(2)} Z:${t.z.toFixed(2)}`;
    let palletStr = '';
    if (this.lastSelectedMesh) {
      const box = new THREE.Box3().setFromObject(this.lastSelectedMesh);
      const center = box.getCenter(new THREE.Vector3());
      const id = this.lastSelectedMesh.userData?.id || '';
      palletStr = `${id} X:${center.x.toFixed(2)} Y:${center.y.toFixed(2)} Z:${center.z.toFixed(2)}`;
    }
    this.onCoordsUpdate?.(camStr, tgtStr, palletStr);
  }

  async loadModel(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              this.processMesh(child);
            }
          });
          this.scene.add(model);
          this.buildMeshByName();
          this.modelReady = true;
          this.onModelLoaded?.();
          resolve();
        },
        undefined,
        (err) => reject(err)
      );
    });
  }

  private processMesh(mesh: THREE.Mesh): void {
    const name = mesh.name || mesh.userData.id || '';
    if (!name) return;

    if (name === 'Jaula') {
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0x3b5998,
        transparent: true,
        opacity: 0.25,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });
      mesh.userData.jaula = true;
      this.meshes.set(name, mesh);
      return;
    }

    if (isSubPaletaName(name)) {
      mesh.userData.subPaleta = true;
      mesh.userData.id = name.replace(/-\d+$/, '');
      this.subPaletaMeshes.set(mesh.uuid, mesh);
      this.meshes.set(name, mesh);
      return;
    }

    mesh.userData.id = name;
    this.meshes.set(name, mesh);
  }

  private buildMeshByName(): void {
    this.meshByName.clear();
    this.meshes.forEach((mesh, name) => {
      this.meshByName.set(name, mesh);
    });
  }

  updateSceneFromInventario(data: InventoryEntry[]): void {
    this.datosInventario = data;
    const meshByName = this.meshByName;

    this.meshes.forEach((child, name) => {
      if (name === 'Jaula' || child.userData.subPaleta) return;

      const isRack = /^[1-9]/.test(name) || isTransitId(name) || isFormulacionId(name) || isGalponAnexoId(name) || isJaulaId(name);
      if (!isRack) return;

      const infoRacks = getEntriesForId(name, data);
      if (infoRacks.length > 0) {
        child.userData = Object.assign({}, infoRacks[0], { entries: infoRacks });
        child.userData.estado = mergeEntryState(infoRacks);
      } else {
        child.userData = { id: name, entries: [], producto: '', codigo: '', lote: '', cantidad: 0, um: '', estado: 'liberado' };
      }
      child.material = getRackMaterial(child.userData as RackUserData);
    });

    this.gestionarSubPaletas(data);
    this.applyPaletaSpread(meshByName);
    this.applySearchFilter();
  }

  private gestionarSubPaletas(data: InventoryEntry[]): void {
    this.subPaletaMeshes.forEach((child) => {
      const name = child.name;
      const parentId = name.replace(/-\d+$/, '');
      const parentRacks = getEntriesForId(parentId, data);
      child.userData.id = parentId;
      const idx = parseInt(name.split('-').pop()!, 10);
      let cumulative = 0;
      let entry = parentRacks[0];
      for (let k = 0; k < parentRacks.length; k++) {
        cumulative += getEffectivePositions(parentRacks[k]);
        if (idx <= cumulative) { entry = parentRacks[k]; break; }
      }
      const show = idx <= cumulative && isSlotVisible(idx, entry ? entry.nivel : 0);
      child.visible = show || isFormulacionId(parentId) || isJaulaId(parentId);
      child.userData.hiddenByPaletas = !show;
      if (show) {
        child.material = getRackMaterial(entry);
        child.userData = Object.assign({}, entry, { subPaleta: true, id: parentId, hiddenByPaletas: false });
      } else if (isFormulacionId(parentId) || isJaulaId(parentId)) {
        child.material = getRackMaterial({ id: parentId, cantidad: 0, estado: 'liberado', entries: [] } as any);
        child.userData = { id: parentId, producto: '', codigo: '', lote: '', cantidad: 0, um: '', estado: 'liberado', subPaleta: true, hiddenByPaletas: false };
      }
    });
  }

  private applyPaletaSpread(meshByName: Map<string, THREE.Mesh>): void {
    const occupied = new Set<string>();
    this.meshes.forEach((mesh, name) => {
      if (isFiveDigitId(name) && mesh.userData.entries && mesh.userData.entries.length > 0) {
        const firstEntry = mesh.userData.entries[0];
        const p = parseInt(String(firstEntry.paletas)) || 0;
        if (p <= 1) return;

        const base = name.substring(0, 3);
        let col = name[3];
        let level = name[4];
        const alwaysVertical = name === '110411040';

        occupied.add(name);
        for (let n = 1; n < p; n++) {
          let found: string | null = null;

          if (!alwaysVertical) {
            const hCol = col === '1' ? '2' : '1';
            const hName = base + hCol + level;
            if (meshByName.has(hName) && !occupied.has(hName)) {
              found = hName;
            }
          }

          if (!found) {
            const vLevel = parseInt(level, 10);
            const candidates: string[] = [];
            if (vLevel < 4) candidates.push(base + col + (vLevel + 1));
            if (vLevel > 1) candidates.push(base + col + (vLevel - 1));
            for (const c of candidates) {
              if (meshByName.has(c) && !occupied.has(c)) {
                found = c;
                break;
              }
            }
          }

          if (!found) break;

          const adj = meshByName.get(found)!;
          adj.userData = Object.assign({}, firstEntry, { id: found, name: found, entries: [firstEntry], _paletaSpreadDone: true });
          adj.material = getRackMaterial(adj.userData as RackUserData);
          occupied.add(found);
          col = found[3];
          level = found[4];
        }
      }
    });
  }

  applySearchFilter(): void {
    const term = this.currentSearchTerm.toLowerCase().trim();
    const pasillo = this.pasilloSeleccionado;
    const statusFilter = this.currentStatusFilter;

    this.meshes.forEach((mesh, name) => {
      if (name === 'Jaula') { mesh.visible = true; return; }
      if (mesh.userData.hiddenByPaletas) return;

      let visible = true;

      if (pasillo !== 'todos') {
        const primerDigito = name[0];
        if (pasillo === 'T') visible = /^T\d{2}$/.test(name);
        else if (pasillo === 'A') visible = /^A\d{3}$/.test(name);
        else if (pasillo === 'P') visible = /^P\d{2}$/.test(name);
        else if (pasillo === 'S') visible = /^SQ\d{2}$/.test(name);
        else visible = primerDigito === pasillo;
      }

      if (visible && term) {
        const entries = mesh.userData.entries || this.datosInventario.filter((e) => e.id === (mesh.userData.id || name));
        const match = entries.some((e: any) => {
          const prod = (e.producto || '').toLowerCase();
          const cod = (e.codigo || '').toLowerCase();
          const id = (e.id || name).toLowerCase();
          const lote = (e.lote || '').toLowerCase();
          return prod.includes(term) || cod.includes(term) || id.includes(term) || lote.includes(term);
        });
        if (!match) visible = false;
      }

      if (visible && statusFilter) {
        const entries = mesh.userData.entries || this.datosInventario.filter((e) => e.id === (mesh.userData.id || name));
        const match = entries.some((e: any) => (e.estado || '').toLowerCase() === statusFilter);
        if (!match) visible = false;
      }

      mesh.visible = true;
      if (mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (visible) {
          mat.transparent = false;
          mat.opacity = 1.0;
        } else {
          mat.transparent = true;
          mat.opacity = 0.03;
        }
        mat.needsUpdate = true;
      }
    });
  }

  focusObject(object: THREE.Mesh, duration = 900): void {
    const id = object.userData?.id as string;
    if (id && (isTransitId(id) || isFormulacionId(id) || isGalponAnexoId(id) || isJaulaId(id))) {
      this.focusTransitObject(object, duration);
    } else if (isFrontFacingLocation(id)) {
      this.focusObjectFront(object, duration);
    } else {
      this.smoothFocus(object, duration);
    }
  }

  smoothFocus(object: THREE.Mesh, duration = 900): void {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const id = object.userData?.id as string;

    let frontDir = getFrontDirectionFromId(id);
    let signZ = frontDir ? frontDir.z : Math.sign(this.camera.position.z - center.z || 1);

    let inclinacionX = 2.0;
    let inclinacionY = 0.55;
    let factorProfundidadZ = signZ * -1.0;

    if (center.y < 3.2) {
      inclinacionY = 1.1;
      factorProfundidadZ = signZ * -0.55;
    } else if (center.y < 5.5) {
      inclinacionY = 0.75;
      factorProfundidadZ = signZ * -0.8;
    }

    const baseDir = new THREE.Vector3(inclinacionX, inclinacionY, factorProfundidadZ).normalize();
    const distance = maxDim * 3.48;
    const targetPos = center.clone().add(baseDir.multiplyScalar(distance));

    this.animateCamera(this.camera.position, this.controls.target, targetPos, center, duration);
  }

  focusObjectFront(object: THREE.Mesh, duration = 900): void {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const id = object.userData?.id as string;

    let frontDir = getFrontDirectionFromId(id);
    let signZ = frontDir ? frontDir.z : 1.0;

    let inclinacionX = -2.0;
    let inclinacionY = 0.55;
    let factorProfundidadZ = signZ;

    if (center.y < 3.2) {
      inclinacionY = 1.15;
      factorProfundidadZ = signZ * 0.75;
    } else if (center.y < 5.5) {
      inclinacionY = 0.80;
      factorProfundidadZ = signZ * 0.85;
    } else {
      factorProfundidadZ = signZ * 1.2;
    }

    const baseDir = new THREE.Vector3(inclinacionX, inclinacionY, factorProfundidadZ).normalize();
    const distance = maxDim * 3.48;
    const targetPos = center.clone().add(baseDir.multiplyScalar(distance));

    this.animateCamera(this.camera.position, this.controls.target, targetPos, center, duration);
  }

  focusTransitObject(object: THREE.Mesh, duration = 900): void {
    const id = object.userData?.id as string;
    const baseId = (id || '').replace(/-.*$/, '');
    const streetMeshes: THREE.Object3D[] = [];

    this.meshes.forEach((mesh) => {
      if (!mesh.visible) return;
      const cid = mesh.userData?.id as string;
      const cname = mesh.name || '';
      if (cid === baseId || cname === baseId || (cname.indexOf(baseId + '-') === 0 && mesh.visible)) {
        streetMeshes.push(mesh);
      }
    });

    if (streetMeshes.length === 0) { this.smoothFocus(object, duration); return; }

    const sBox = new THREE.Box3();
    for (const m of streetMeshes) sBox.expandByObject(m);
    const sCenter = sBox.getCenter(new THREE.Vector3());
    const sSize = sBox.getSize(new THREE.Vector3());
    const sMaxDim = Math.max(sSize.x, sSize.y, sSize.z);
    const sDir = new THREE.Vector3(-0.48, 0.40, 0.78).normalize();
    const sDist = sMaxDim * 1.8;
    const targetPos = sCenter.clone().add(sDir.clone().multiplyScalar(sDist));

    this.animateCamera(this.camera.position, this.controls.target, targetPos, sCenter, duration);
  }

  focusZone(zone: string): void {
    if (zone === 'todos') {
      this.resetView();
      return;
    }

    const matches: THREE.Mesh[] = [];
    this.meshes.forEach((mesh, name) => {
      if (name === 'Jaula') return;
      if (zone === 'T' && /^T\d{2}$/.test(name)) matches.push(mesh);
      else if (zone === 'A' && /^A\d{3}$/.test(name)) matches.push(mesh);
      else if (zone === 'P' && /^P\d{2}$/.test(name)) matches.push(mesh);
      else if (zone === 'S' && /^SQ\d{2}$/.test(name)) matches.push(mesh);
      else if (name[0] === zone) matches.push(mesh);
    });

    if (matches.length === 0) { this.resetView(); return; }

    if (zone === 'P') {
      const target = new THREE.Vector3(-63.84, 26.01, 33.04);
      const dir = new THREE.Vector3(-0.48, 0.45, 0.74).normalize();
      const pos = target.clone().add(dir.multiplyScalar(25));
      this.animateCamera(this.camera.position, this.controls.target, pos, target, 900);
      return;
    }

    const box = new THREE.Box3();
    for (const m of matches) box.expandByObject(m);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = Math.max(maxDim * 0.5 + 8, maxDim * 0.7 + 12);

    const dir = new THREE.Vector3(0.3, 0.4, 0.8).normalize();
    const pos = center.clone().add(dir.multiplyScalar(dist));
    this.animateCamera(this.camera.position, this.controls.target, pos, center, 900);
  }

  focusSearchMatches(): void {
    const matches = this.getSearchMatches();
    if (matches.length === 0) { this.resetView(); return; }

    const activeAisle = this.pasilloSeleccionado;
    if (activeAisle === 'P') {
      this.focusZone('P');
      return;
    }
    if (activeAisle === 'T' || activeAisle === 'A' || activeAisle === 'S') {
      this.focusZone(activeAisle);
      return;
    }

    const box = new THREE.Box3();
    for (const m of matches) box.expandByObject(m);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = Math.max(maxDim * 0.5 + 8, maxDim * 0.7 + 12);

    const dir = new THREE.Vector3(0, 0.5, 1).normalize();
    const pos = center.clone().add(dir.multiplyScalar(dist));
    this.animateCamera(this.camera.position, this.controls.target, pos, center, 900);
  }

  private getSearchMatches(): THREE.Mesh[] {
    const term = this.currentSearchTerm.toLowerCase().trim();
    const pasillo = this.pasilloSeleccionado;
    const matches: THREE.Mesh[] = [];

    this.meshes.forEach((mesh, name) => {
      if (name === 'Jaula') return;
      if (pasillo !== 'todos') {
        if (pasillo === 'T' && !/^T\d{2}$/.test(name)) return;
        else if (pasillo === 'A' && !/^A\d{3}$/.test(name)) return;
        else if (pasillo === 'P' && !/^P\d{2}$/.test(name)) return;
        else if (pasillo === 'S' && !/^SQ\d{2}$/.test(name)) return;
        else if (/^\d+$/.test(pasillo) && name[0] !== pasillo) return;
      }
      if (term) {
        const entries = mesh.userData.entries || this.datosInventario.filter((e) => e.id === (mesh.userData.id || name));
        const match = entries.some((e: any) => {
          const prod = (e.producto || '').toLowerCase();
          const cod = (e.codigo || '').toLowerCase();
          const id = (e.id || name).toLowerCase();
          const lote = (e.lote || '').toLowerCase();
          return prod.includes(term) || cod.includes(term) || id.includes(term) || lote.includes(term);
        });
        if (!match) return;
      }
      matches.push(mesh);
    });

    return matches;
  }

  resetView(): void {
    const defaultPos = new THREE.Vector3(15, 22, 35);
    const defaultTarget = new THREE.Vector3(0, 8, 0);

    if (this.pasilloSeleccionado !== 'todos') {
      const matches = this.getSearchMatches();
      if (matches.length > 0) {
        const box = new THREE.Box3();
        for (const m of matches) box.expandByObject(m);
        const center = box.getCenter(new THREE.Vector3());
        const pos = new THREE.Vector3(center.x - 1.05, 12.28, center.z + 32.0);
        this.animateCamera(this.camera.position, this.controls.target, pos, new THREE.Vector3(center.x, -0.51, center.z), 1000);
        return;
      }
    }

    this.animateCamera(this.camera.position, this.controls.target, defaultPos, defaultTarget, 1000);
  }

  private animateCamera(fromPos: THREE.Vector3, fromTarget: THREE.Vector3, toPos: THREE.Vector3, toTarget: THREE.Vector3, duration: number): void {
    const startPos = fromPos.clone();
    const startTarget = fromTarget.clone();
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.camera.position.lerpVectors(startPos, toPos, ease);
      this.controls.target.lerpVectors(startTarget, toTarget, ease);
      this.controls.update();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  getSearchSuggestions(data: InventoryEntry[]): { id: string; producto: string; codigo: string }[] {
    const term = this.currentSearchTerm.toLowerCase().trim();
    if (!term) return [];

    const seen = new Set<string>();
    const results: { id: string; producto: string; codigo: string }[] = [];

    for (const item of data) {
      const prod = (item.producto || '').toLowerCase();
      const cod = (item.codigo || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      if (prod.includes(term) || cod.includes(term) || id.includes(term)) {
        const key = `${item.producto}|${item.codigo}|${item.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({ id: item.id, producto: item.producto, codigo: item.codigo });
          if (results.length >= 20) break;
        }
      }
    }
    return results;
  }

  applyStatusFilter(status: string | null, data: InventoryEntry[]): void {
    this.currentStatusFilter = status;
    this.applySearchFilter();
  }

  dispose(): void {
    cancelAnimationFrame(this.animId);
    if (this.pressAnimId) cancelAnimationFrame(this.pressAnimId);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
