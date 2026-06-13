import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { RackUserData, InventoryEntry } from '../../types';
import { isTransitId, isFormulacionId, isGalponAnexoId, isJaulaId } from '../../utils/idHelpers';
import { getRackMaterial } from '../../utils/materials';

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private animId: number = 0;
  private meshes: Map<string, THREE.Mesh> = new Map();
  private subPaletaMeshes: Map<string, THREE.Mesh> = new Map();
  private modelReady: boolean = false;

  public onMeshClick?: (userData: RackUserData) => void;
  public onMeshHover?: (id: string | null) => void;
  public onModelLoaded?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(15, 22, 35);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 120;
    this.controls.target.set(0, 8, 0);
    this.controls.maxPolarAngle = Math.PI / 2.1;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupLighting();
    this.setupGround();
    this.setupResize();
    this.setupEvents();
    this.startLoop();
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffeedd, 2.2);
    dir.position.set(20, 40, 20);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    this.scene.add(dir);

    const fill = new THREE.DirectionalLight(0x4488ff, 0.5);
    fill.position.set(-20, 0, -20);
    this.scene.add(fill);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x362d1e, 0.8);
    this.scene.add(hemi);
  }

  private setupGround(): void {
    const geo = new THREE.PlaneGeometry(120, 120);
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9, metalness: 0.1 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private setupResize(): void {
    window.addEventListener('resize', () => this.onResize());
  }

  private setupEvents(): void {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('click', (e) => this.onClick(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  private onResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private onClick(event: MouseEvent): void {
    const hit = this.intersect(event);
    if (hit && this.onMeshClick) {
      this.onMeshClick(hit.userData as RackUserData);
    }
  }

  private onMouseMove(event: MouseEvent): void {
    const hit = this.intersect(event);
    if (this.onMeshHover) {
      this.onMeshHover(hit ? hit.userData.id || null : null);
    }
    this.renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
  }

  private intersect(event: MouseEvent): THREE.Intersection | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.meshes.values());
    const intersects = this.raycaster.intersectObjects(meshes, false);
    return intersects.length > 0 ? intersects[0] : null;
  }

  private startLoop(): void {
    const tick = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.animId = requestAnimationFrame(tick);
    };
    tick();
  }

  async loadModel(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              this.processMesh(child);
            }
          });
          this.scene.add(gltf.scene);
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
      this.subPaletaMeshes.set(mesh.uuid, mesh);
      this.meshes.set(name, mesh);
      return;
    }

    mesh.userData.id = name;
    this.meshes.set(name, mesh);
  }

  applySearchFilter(
    _pasillo: string,
    _statusFilter: string | null,
    _searchQuery: string,
    _data: InventoryEntry[]
  ): void {
    // Will be implemented
  }

  focusObject(id: string): void {
    const mesh = this.meshes.get(id);
    if (!mesh) return;
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = Math.max(maxDim * 1.5, 8);
    this.smoothFocus(center, dist);
  }

  focusZone(_zone: string): void {
    // Will be implemented
  }

  private smoothFocus(target: THREE.Vector3, distance: number): void {
    const dir = new THREE.Vector3(0, 1, 1).normalize();
    const pos = target.clone().add(dir.multiplyScalar(distance));
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const duration = 600;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerpVectors(startPos, pos, ease);
      this.controls.target.lerpVectors(startTarget, target, ease);
      this.controls.update();
      if (t < 1) requestAnimationFrame(animate);
    };
    animate();
  }

  updateColors(data: Map<string, InventoryEntry[]>): void {
    for (const [name, mesh] of this.meshes) {
      if (name === 'Jaula' || mesh.userData.subPaleta) continue;
      const entries = data.get(name);
      const estado = entries && entries.length > 0 ? entries[0].estado : null;
      mesh.material = getRackMaterial(estado ? { id: name, estado } : null);
    }
  }

  dispose(): void {
    cancelAnimationFrame(this.animId);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

function isSubPaletaName(name: string): boolean {
  return /^(T\d{2}|A\d{3}|P\d{2}|SQ\d{2})-\d+$/.test(name);
}
