import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { belongsToAssembly } from "@/crates/building-graph/integrity";
import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";
import { isStageVisible } from "@/crates/construction-sequence/visibility";
import { explodedCenter } from "@/crates/explode/engine";
import type { LabSnapshot } from "@/crates/session/apply";
import { workingGraph } from "@/crates/session/apply";
import { tradeOf } from "@/crates/trades/infer";
import { createLabMaterials, materialFor, type LabMaterials } from "./materials";

const TMP = new THREE.Vector3();
const TMP_DIR = new THREE.Vector3();
const TMP_FROM = new THREE.Vector3();
const Y_UP = new THREE.Vector3(0, 1, 0);
const RAY = new THREE.Raycaster();
const NDC = new THREE.Vector2();

export type HouseLabHooks = {
  onSelect: (id: string | null, additive: boolean) => void;
  onHover: (id: string | null) => void;
  onFitRequest?: (kind: "selected" | "house") => void;
};

export class HouseLab {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  readonly root: THREE.Group;
  readonly clipPlane: THREE.Plane;
  graph: BuildingGraph;
  private mats: LabMaterials;
  private unit: THREE.BoxGeometry;
  private meshes = new Map<string, THREE.Mesh>();
  private outlines = new Map<string, THREE.LineSegments>();
  private hoverId: string | null = null;
  private reducedMotion: boolean;
  private disposed = false;
  private raf = 0;
  private last = 0;
  private hooks: HouseLabHooks;
  private snapshot: LabSnapshot | null = null;
  drawCalls = 0;
  fps = 0;
  private frames = 0;
  private fpsAcc = 0;

  constructor(canvas: HTMLCanvasElement, graph: BuildingGraph, hooks: HouseLabHooks) {
    this.graph = graph;
    this.hooks = hooks;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(0xc5cdd4, 1);
    const gl = this.renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    const soft = /swiftshader|llvmpipe|software|microsoft basic/i.test(gpu);
    this.renderer.shadowMap.enabled = !soft;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.localClippingEnabled = true;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xc5cdd4);
    this.scene.fog = new THREE.Fog(0xc5cdd4, 38, 88);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.08, 140);
    this.camera.position.set(13.2, 6.8, 14.8);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = !this.reducedMotion;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    this.controls.minPolarAngle = 0.08;
    this.controls.minDistance = 2.4;
    this.controls.maxDistance = 56;
    this.controls.target.set(0, 1.05, 0);
    this.controls.update();

    this.clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    this.mats = createLabMaterials();
    this.unit = new THREE.BoxGeometry(1, 1, 1);
    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.addLights();
    this.buildMeshes();
    this.bind(canvas);
    this.resize();
    this.last = performance.now();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  private addLights() {
    const hemi = new THREE.HemisphereLight(0xe4ebf2, 0x7a7468, 0.72);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff3e2, 1.55);
    sun.position.set(14, 22, 10);
    sun.castShadow = this.renderer.shadowMap.enabled;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 70;
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.bias = -0.00018;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xc9d4e0, 0.35);
    fill.position.set(-12, 8, -8);
    this.scene.add(fill);
  }

  private buildMeshes() {
    for (const c of Object.values(this.graph.components)) {
      if (c.geometry.kind !== "box") continue;
      const mesh = new THREE.Mesh(this.unit, materialFor(c.material.family, this.mats));
      const shadowTypes = new Set([
        "foundation-wall",
        "footing",
        "subfloor",
        "wall-sheathing",
        "roof-sheathing",
        "beam",
        "pad-footing",
        "roof-covering",
        "cladding",
        "drywall",
      ]);
      mesh.castShadow = this.renderer.shadowMap.enabled && shadowTypes.has(c.type);
      mesh.receiveShadow = this.renderer.shadowMap.enabled;
      mesh.userData.id = c.id;
      mesh.matrixAutoUpdate = true;
      this.applyCanonical(mesh, c);
      this.root.add(mesh);
      this.meshes.set(c.id, mesh);
    }
  }

  private ensureMeshes(graph: BuildingGraph) {
    for (const c of Object.values(graph.components)) {
      if (c.geometry.kind !== "box" || this.meshes.has(c.id)) continue;
      const mesh = new THREE.Mesh(this.unit, materialFor(c.material.family, this.mats));
      mesh.userData.id = c.id;
      mesh.matrixAutoUpdate = true;
      this.applyCanonical(mesh, c);
      this.root.add(mesh);
      this.meshes.set(c.id, mesh);
    }
    for (const [id, mesh] of this.meshes) {
      if (graph.components[id]) continue;
      this.root.remove(mesh);
      this.meshes.delete(id);
    }
  }

  private applyCanonical(mesh: THREE.Mesh, c: BuildingComponent, exploded?: [number, number, number]) {
    const [cx, cy, cz] = exploded ?? c.geometry.center;
    const [bx, by, bz] = c.geometry.center;
    const ox = cx - bx;
    const oy = cy - by;
    const oz = cz - bz;
    if (c.run) {
      const [fx, fy, fz] = c.run.from;
      const [tx, ty, tz] = c.run.to;
      TMP_FROM.set(fx + ox, fy + oy, fz + oz);
      TMP.set(tx + ox, ty + oy, tz + oz);
      TMP_DIR.subVectors(TMP, TMP_FROM);
      const len = Math.max(TMP_DIR.length(), 0.02);
      const dia = Math.min(c.geometry.size[0], c.geometry.size[1], c.geometry.size[2]);
      mesh.position.copy(TMP_FROM).add(TMP).multiplyScalar(0.5);
      mesh.scale.set(dia, len, dia);
      mesh.quaternion.setFromUnitVectors(Y_UP, TMP_DIR.normalize());
      return;
    }
    const [sx, sy, sz] = c.geometry.size;
    mesh.position.set(cx, cy, cz);
    mesh.scale.set(sx, sy, sz);
    mesh.quaternion.identity();
    const r = c.geometry.rotation;
    mesh.rotation.set(r?.[0] ?? 0, r?.[1] ?? 0, r?.[2] ?? 0);
  }

  sync(state: LabSnapshot) {
    this.snapshot = state;
    const graph = workingGraph(state);
    this.graph = graph;
    this.ensureMeshes(graph);
    const removed = new Set(state.removedIds);
    const hidden = new Set(state.hiddenIds);
    const isolated = state.isolatedIds ? new Set(state.isolatedIds) : null;
    const traced = new Set(state.trace?.componentIds ?? []);
    const xrayTypes = new Set([
      "wall-sheathing",
      "roof-sheathing",
      "subfloor",
      "site",
      "drywall",
      "paint",
      "cladding",
      "roof-covering",
      "wrb",
      "insulation",
      "underlayment",
    ]);

    this.renderer.clippingPlanes = state.sectionEnabled ? [this.clipPlane] : [];
    this.clipPlane.constant = state.sectionOffset;

    const t = performance.now() / 1000;
    const pulse = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(t * 3));
    this.mats.flowCold.emissiveIntensity = pulse;
    this.mats.flowHot.emissiveIntensity = pulse;
    this.mats.flowDrain.emissiveIntensity = pulse;
    this.mats.flowVent.emissiveIntensity = pulse;
    this.mats.flowLive.emissiveIntensity = pulse;
    this.mats.flowAir.emissiveIntensity = pulse;

    for (const [id, mesh] of this.meshes) {
      const c = graph.components[id];
      if (!c) continue;
      const trade = tradeOf(c);
      const layer = state.tradeLayers[trade];
      const finishHidden = state.hideFinish && trade === "finish";
      const visible =
        isStageVisible(c, state.constructionStage, removed) && !hidden.has(id) && layer !== "off" && !finishHidden;
      mesh.visible = visible;
      if (!visible) continue;

      const exploded = explodedCenter(graph, c, state.explodeAmount, state.explodeScope);
      this.applyCanonical(mesh, c, exploded);

      const isIso = !isolated || isolated.has(id);
      const isXray = state.xray && xrayTypes.has(c.type);
      const flowMat = flowMaterial(c, state, this.mats);
      const base = flowMat ?? materialFor(c.material.family, this.mats);
      const service =
        c.type.startsWith("pipe-") ||
        c.type === "cable" ||
        c.type === "duct" ||
        c.type === "trap" ||
        c.type === "fixture" ||
        c.type === "terminal" ||
        c.type === "device-box" ||
        c.type === "receptacle" ||
        c.type === "switch" ||
        c.type === "luminaire" ||
        c.type === "panel";
      if (traced.has(id)) {
        mesh.material = this.mats.flowLive;
        mesh.castShadow = false;
      } else if (flowMat) {
        mesh.material = flowMat;
        mesh.castShadow = false;
      } else if (state.flowMode !== "off") {
        mesh.material = this.mats.ghostFaint;
        mesh.castShadow = false;
      } else if (isXray) {
        mesh.material = this.mats.ghostFaint;
        mesh.castShadow = false;
      } else if (state.xray && (trade === "structure" || trade === "foundation") && !service) {
        mesh.material = this.mats.ghostHost;
        mesh.castShadow = false;
      } else if (!isIso || layer === "ghost") {
        mesh.material = this.mats.ghost;
        mesh.castShadow = false;
      } else {
        mesh.material = base;
      }
    }

    this.syncOutlines(state);
  }

  private syncOutlines(state: LabSnapshot) {
    const want = new Set<string>();
    if (state.selectedId) want.add(state.selectedId);
    if (this.hoverId) want.add(this.hoverId);
    for (const id of state.checkHighlights) want.add(id);
    for (const id of state.trace?.componentIds ?? []) want.add(id);
    for (const [id, line] of this.outlines) {
      if (!want.has(id)) {
        this.root.remove(line);
        line.geometry.dispose();
        this.outlines.delete(id);
      }
    }
    for (const id of want) {
      const mesh = this.meshes.get(id);
      if (!mesh || !mesh.visible) continue;
      let line = this.outlines.get(id);
      if (!line) {
        const geo = new THREE.EdgesGeometry(this.unit);
        const mat = state.checkHighlights.includes(id)
          ? this.mats.issue
          : state.trace?.componentIds.includes(id)
            ? this.mats.trace
            : this.mats.selected;
        line = new THREE.LineSegments(geo, mat);
        line.userData.id = id;
        this.root.add(line);
        this.outlines.set(id, line);
      }
      line.position.copy(mesh.position);
      line.quaternion.copy(mesh.quaternion);
      line.scale.copy(mesh.scale).multiplyScalar(1.01);
      line.material = state.checkHighlights.includes(id)
        ? this.mats.issue
        : state.trace?.componentIds.includes(id)
          ? this.mats.trace
          : this.mats.selected;
    }
  }

  pick(ev: { clientX: number; clientY: number }): string | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    NDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    NDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    RAY.setFromCamera(NDC, this.camera);
    const hits = RAY.intersectObjects([...this.meshes.values()].filter((m) => m.visible), false);
    return (hits[0]?.object.userData.id as string | undefined) ?? null;
  }

  private bind(canvas: HTMLCanvasElement) {
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointermove", (ev) => {
      if (ev.buttons) return;
      const id = this.pick(ev);
      if (id !== this.hoverId) {
        this.hoverId = id;
        this.hooks.onHover(id);
        if (this.snapshot) this.sync(this.snapshot);
      }
      canvas.style.cursor = id ? "pointer" : "grab";
    });
    canvas.addEventListener("click", (ev) => {
      const id = this.pick(ev);
      this.hooks.onSelect(id, ev.shiftKey);
    });
    canvas.addEventListener("dblclick", (ev) => {
      ev.preventDefault();
      const id = this.pick(ev);
      if (id) this.hooks.onSelect(id, false);
      this.fitSelected();
    });
  }

  setView(pos: [number, number, number], target: [number, number, number]) {
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.controls.target.set(target[0], target[1], target[2]);
    this.controls.update();
  }

  fitHouse() {
    const box = new THREE.Box3();
    let any = false;
    for (const [id, mesh] of this.meshes) {
      const c = this.graph.components[id];
      if (!c || c.type === "site") continue;
      box.expandByObject(mesh);
      any = true;
    }
    if (!any) {
      this.animateCamera(new THREE.Vector3(13.2, 6.8, 14.8), new THREE.Vector3(0, 1.05, 0));
      return;
    }
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(TMP);
    const dist = Math.max(size.x, size.y, size.z, 7) * 1.25;
    this.animateCamera(center.clone().add(new THREE.Vector3(dist * 0.7, Math.max(4.2, dist * 0.38), dist * 0.82)), center);
  }

  resetCamera() {
    this.fitHouse();
  }

  fitSelected() {
    const id = this.snapshot?.selectedId;
    if (!id) {
      this.fitHouse();
      return;
    }
    const mesh = this.meshes.get(id);
    const c = this.graph.components[id];
    if (!mesh && c?.type === "assembly") {
      this.fitAssembly(id);
      return;
    }
    if (!mesh) return;
    const size = Math.max(c?.geometry.size[0] ?? 1, c?.geometry.size[1] ?? 1, c?.geometry.size[2] ?? 1);
    const dist = Math.max(2.8, size * 3.2);
    const pos = mesh.position.clone().add(new THREE.Vector3(dist * 0.7, dist * 0.45, dist * 0.8));
    this.animateCamera(pos, mesh.position.clone());
  }

  private fitAssembly(id: string) {
    const box = new THREE.Box3();
    let any = false;
    for (const [cid, mesh] of this.meshes) {
      if (!belongsToAssembly(this.graph, cid, id)) continue;
      if (!mesh.visible) continue;
      box.expandByObject(mesh);
      any = true;
    }
    if (!any) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(TMP);
    const dist = Math.max(size.x, size.y, size.z) * 1.8;
    this.animateCamera(center.clone().add(new THREE.Vector3(dist * 0.7, dist * 0.5, dist * 0.8)), center);
  }

  private animateCamera(pos: THREE.Vector3, target: THREE.Vector3) {
    if (this.reducedMotion) {
      this.camera.position.copy(pos);
      this.controls.target.copy(target);
      this.controls.update();
      return;
    }
    const startP = this.camera.position.clone();
    const startT = this.controls.target.clone();
    const t0 = performance.now();
    const dur = 420;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - (1 - t) ** 3;
      this.camera.position.lerpVectors(startP, pos, e);
      this.controls.target.lerpVectors(startT, target, e);
      this.controls.update();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  handleCameraCommand(cmd: LabSnapshot["cameraCommand"]) {
    if (cmd === "reset" || cmd === "fit-house") this.fitHouse();
    if (cmd === "fit-selected") this.fitSelected();
  }

  resize() {
    const canvas = this.renderer.domElement;
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || window.innerWidth;
    const h = parent?.clientHeight || window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private tick() {
    if (this.disposed) return;
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    this.controls.update();
    if (this.snapshot && this.snapshot.flowMode !== "off") {
      const pulse = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin((now / 1000) * 3));
      this.mats.flowCold.emissiveIntensity = pulse;
      this.mats.flowHot.emissiveIntensity = pulse;
      this.mats.flowDrain.emissiveIntensity = pulse;
      this.mats.flowVent.emissiveIntensity = pulse;
      this.mats.flowLive.emissiveIntensity = pulse;
      this.mats.flowAir.emissiveIntensity = pulse;
    }
    this.renderer.render(this.scene, this.camera);
    this.drawCalls = this.renderer.info.render.calls;
    this.frames += 1;
    this.fpsAcc += dt;
    if (this.fpsAcc >= 0.4) {
      this.fps = this.frames / this.fpsAcc;
      this.frames = 0;
      this.fpsAcc = 0;
    }
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.controls.dispose();
    this.unit.dispose();
    this.mats.dispose();
    for (const line of this.outlines.values()) line.geometry.dispose();
    this.renderer.dispose();
  }
}

function flowMaterial(c: BuildingComponent, state: LabSnapshot, mats: LabMaterials) {
  const tags = c.tags ?? [];
  if (state.flowMode === "control-layers" || state.flowMode.startsWith("control-")) {
    const want =
      state.flowMode === "control-water"
        ? "water-control"
        : state.flowMode === "control-air"
          ? "air-control"
          : state.flowMode === "control-vapour"
            ? "vapour-control"
            : state.flowMode === "control-thermal"
              ? "thermal-control"
              : null;
    if (want) {
      if (tags.includes(want)) {
        if (want === "water-control") return mats.layerWater;
        if (want === "air-control") return mats.layerAir;
        if (want === "vapour-control") return mats.layerVapour;
        return mats.layerThermal;
      }
      return mats.ghost;
    }
    if (tags.includes("water-control")) return mats.layerWater;
    if (tags.includes("air-control")) return mats.layerAir;
    if (tags.includes("vapour-control")) return mats.layerVapour;
    if (tags.includes("thermal-control")) return mats.layerThermal;
    return mats.ghost;
  }
  if (state.flowMode === "supply" && (tags.includes("supply") || c.type === "pipe-supply" || c.type === "water-heater" || c.type === "fixture")) {
    return tags.includes("hot") ? mats.flowHot : mats.flowCold;
  }
  if (state.flowMode === "dwv" && (tags.includes("dwv") || c.type === "pipe-dwv" || c.type === "trap" || c.type === "fixture")) {
    return mats.flowDrain;
  }
  if (state.flowMode === "vent" && (tags.includes("vent") || c.type === "pipe-vent")) {
    return mats.flowVent;
  }
  if (state.flowMode === "energize" && (tradeOf(c) === "electrical" || tags.includes("electrical"))) {
    return mats.flowLive;
  }
  if (state.flowMode === "airflow-supply" && (tags.includes("supply") || c.type === "heat-pump-indoor" || c.type === "heat-pump-outdoor")) {
    return mats.flowAir;
  }
  if (state.flowMode === "airflow-return" && tags.includes("return")) {
    return mats.flowAir;
  }
  if (state.flowMode === "airflow-exhaust" && tags.includes("exhaust")) {
    return mats.flowAir;
  }
  if (state.flowMode !== "off") {
    return mats.ghostFaint;
  }
  return null;
}

