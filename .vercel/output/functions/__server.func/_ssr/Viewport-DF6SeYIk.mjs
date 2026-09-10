import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as belongsToAssembly, n as useLab, r as explodedCenter } from "./routes-BXp-2rih.mjs";
import { C as Vector3, S as Vector2, _ as Plane, a as CanvasTexture, b as SRGBColorSpace, c as EdgesGeometry, d as HemisphereLight, f as LineBasicMaterial, g as PerspectiveCamera, h as MeshStandardMaterial, i as BoxGeometry, l as Fog, m as Mesh, n as WebGLRenderer, o as Color, p as LineSegments, r as Box3, s as DirectionalLight, t as OrbitControls, u as Group, v as Raycaster, x as Scene, y as RepeatWrapping } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Viewport-DF6SeYIk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isStageVisible(component, stage, removedIds) {
	if (component.geometry.kind === "group") return false;
	if (removedIds.has(component.id)) return false;
	if (component.assembly.stage > stage) return false;
	if (component.assembly.untilStage != null && stage > component.assembly.untilStage) return false;
	return true;
}
function canvasTex(paint, size = 256) {
	const c = document.createElement("canvas");
	c.width = size;
	c.height = size;
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("no 2d");
	paint(ctx, size, size);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.wrapS = RepeatWrapping;
	tex.wrapT = RepeatWrapping;
	tex.anisotropy = 8;
	tex.needsUpdate = true;
	return tex;
}
function wood(base, grain) {
	return canvasTex((ctx, w, h) => {
		ctx.fillStyle = base;
		ctx.fillRect(0, 0, w, h);
		for (let i = 0; i < 48; i++) {
			ctx.strokeStyle = grain;
			ctx.globalAlpha = .08 + i % 7 * .015;
			ctx.lineWidth = 1 + i % 3;
			const y = i / 48 * h + 2;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.bezierCurveTo(w * .3, y + 3, w * .6, y - 4, w, y + 1);
			ctx.stroke();
		}
		ctx.globalAlpha = .06;
		ctx.fillStyle = "#3a2412";
		for (let i = 0; i < 30; i++) ctx.fillRect(i * 37 % w, i * 53 % h, 2, 8);
		ctx.globalAlpha = 1;
	});
}
function osb() {
	return canvasTex((ctx, w, h) => {
		ctx.fillStyle = "#c6a36a";
		ctx.fillRect(0, 0, w, h);
		const colors = [
			"#b08a52",
			"#d4b07a",
			"#9a7344",
			"#c4a070"
		];
		for (let i = 0; i < 220; i++) {
			ctx.fillStyle = colors[i % colors.length];
			ctx.globalAlpha = .45;
			const x = i * 47 % w;
			const y = i * 29 % h;
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(i * 13 % 180 * (Math.PI / 180));
			ctx.fillRect(-10, -3, 18 + i % 10, 4 + i % 3);
			ctx.restore();
		}
		ctx.globalAlpha = 1;
	});
}
function concrete() {
	return canvasTex((ctx, w, h) => {
		ctx.fillStyle = "#8d8c85";
		ctx.fillRect(0, 0, w, h);
		const img = ctx.getImageData(0, 0, w, h);
		for (let i = 0; i < img.data.length; i += 4) {
			const n = i * 13 % 17 - 8;
			img.data[i] = img.data[i] + n;
			img.data[i + 1] = img.data[i + 1] + n;
			img.data[i + 2] = img.data[i + 2] + n;
		}
		ctx.putImageData(img, 0, 0);
		ctx.globalAlpha = .12;
		ctx.fillStyle = "#6e6d66";
		for (let x = 0; x < w; x += 64) ctx.fillRect(x, 0, 1, h);
		for (let y = 0; y < h; y += 64) ctx.fillRect(0, y, w, 1);
		ctx.globalAlpha = 1;
	}, 256);
}
function soil() {
	return canvasTex((ctx, w, h) => {
		ctx.fillStyle = "#5c5144";
		ctx.fillRect(0, 0, w, h);
		ctx.globalAlpha = .25;
		for (let i = 0; i < 200; i++) {
			ctx.fillStyle = i % 2 ? "#4a4036" : "#6a5d4e";
			ctx.fillRect(i * 41 % w, i * 23 % h, 3, 3);
		}
		ctx.globalAlpha = 1;
	});
}
function createLabMaterials() {
	const woodMap = wood("#c4a070", "#5a3818");
	const treatedMap = wood("#73825f", "#2f3a24");
	const braceMap = wood("#b57a48", "#5a3010");
	const osbMap = osb();
	const concMap = concrete();
	const soilMap = soil();
	const std = (map, color, rough, extra) => new MeshStandardMaterial({
		map,
		color,
		roughness: rough,
		metalness: .02,
		envMapIntensity: .4,
		...extra
	});
	const woodMat = std(woodMap, "#d8c09a", .72);
	woodMap.repeat.set(1, 2);
	const treated = std(treatedMap, "#c5d0b0", .78);
	const brace = std(braceMap, "#e0b089", .7);
	const conc = std(concMap, "#cfcfc8", .92);
	conc.bumpMap = concMap;
	conc.bumpScale = .04;
	const osbMat = std(osbMap, "#e6d0a8", .86);
	const soilMat = std(soilMap, "#8a7b68", .95);
	const grass = new MeshStandardMaterial({
		color: "#6e7464",
		roughness: .95,
		metalness: 0
	});
	const ghost = new MeshStandardMaterial({
		color: "#d9d2c5",
		transparent: true,
		opacity: .12,
		depthWrite: false,
		roughness: .9
	});
	const all = [
		woodMat,
		treated,
		brace,
		conc,
		osbMat,
		soilMat,
		grass,
		ghost
	];
	for (const m of all) {
		m.clippingPlanes = [];
		m.clipShadows = true;
	}
	return {
		wood: woodMat,
		treated,
		brace,
		concrete: conc,
		osb: osbMat,
		soil: soilMat,
		grass,
		selected: new LineBasicMaterial({
			color: "#f3ebe1",
			transparent: true,
			opacity: .95
		}),
		issue: new LineBasicMaterial({
			color: "#b55233",
			transparent: true,
			opacity: .95
		}),
		ghost,
		dispose: () => {
			woodMap.dispose();
			treatedMap.dispose();
			braceMap.dispose();
			osbMap.dispose();
			concMap.dispose();
			soilMap.dispose();
			for (const m of all) m.dispose();
		}
	};
}
function materialFor(family, mats) {
	switch (family) {
		case "concrete": return mats.concrete;
		case "wood-treated": return mats.treated;
		case "sheathing": return mats.osb;
		case "soil": return mats.soil;
		case "context": return mats.grass;
		default: return mats.wood;
	}
}
var TMP = new Vector3();
var RAY = new Raycaster();
var NDC = new Vector2();
var HouseLab = class {
	renderer;
	scene;
	camera;
	controls;
	root;
	clipPlane;
	graph;
	mats;
	unit;
	meshes = /* @__PURE__ */ new Map();
	outlines = /* @__PURE__ */ new Map();
	hoverId = null;
	reducedMotion;
	disposed = false;
	raf = 0;
	last = 0;
	hooks;
	snapshot = null;
	drawCalls = 0;
	fps = 0;
	frames = 0;
	fpsAcc = 0;
	constructor(canvas, graph, hooks) {
		this.graph = graph;
		this.hooks = hooks;
		this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.renderer = new WebGLRenderer({
			canvas,
			antialias: true,
			alpha: false,
			powerPreference: "high-performance"
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		this.renderer.setClearColor(12963284, 1);
		const gl = this.renderer.getContext();
		const dbg = gl.getExtension("WEBGL_debug_renderer_info");
		const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
		const soft = /swiftshader|llvmpipe|software|microsoft basic/i.test(gpu);
		this.renderer.shadowMap.enabled = !soft;
		this.renderer.shadowMap.type = 2;
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = 4;
		this.renderer.toneMappingExposure = 1.12;
		this.renderer.localClippingEnabled = true;
		this.scene = new Scene();
		this.scene.background = new Color(12963284);
		this.scene.fog = new Fog(12963284, 38, 88);
		this.camera = new PerspectiveCamera(40, 1, .08, 140);
		this.camera.position.set(15.5, 8.6, 17.5);
		this.controls = new OrbitControls(this.camera, canvas);
		this.controls.enableDamping = !this.reducedMotion;
		this.controls.dampingFactor = .08;
		this.controls.maxPolarAngle = Math.PI / 2 - .04;
		this.controls.minPolarAngle = .08;
		this.controls.minDistance = 2.4;
		this.controls.maxDistance = 56;
		this.controls.target.set(0, 1.35, 0);
		this.controls.update();
		this.clipPlane = new Plane(new Vector3(0, 0, -1), 0);
		this.mats = createLabMaterials();
		this.unit = new BoxGeometry(1, 1, 1);
		this.root = new Group();
		this.scene.add(this.root);
		this.addLights();
		this.buildMeshes();
		this.bind(canvas);
		this.resize();
		this.last = performance.now();
		this.renderer.setAnimationLoop(() => this.tick());
	}
	addLights() {
		const hemi = new HemisphereLight(15002610, 8025192, .72);
		this.scene.add(hemi);
		const sun = new DirectionalLight(16774114, 1.55);
		sun.position.set(14, 22, 10);
		sun.castShadow = this.renderer.shadowMap.enabled;
		sun.shadow.mapSize.set(1024, 1024);
		sun.shadow.camera.near = 2;
		sun.shadow.camera.far = 70;
		sun.shadow.camera.left = -22;
		sun.shadow.camera.right = 22;
		sun.shadow.camera.top = 22;
		sun.shadow.camera.bottom = -22;
		sun.shadow.bias = -18e-5;
		this.scene.add(sun);
		const fill = new DirectionalLight(13227232, .35);
		fill.position.set(-12, 8, -8);
		this.scene.add(fill);
	}
	buildMeshes() {
		for (const c of Object.values(this.graph.components)) {
			if (c.geometry.kind !== "box") continue;
			const mesh = new Mesh(this.unit, materialFor(c.material.family, this.mats));
			const shadowTypes = /* @__PURE__ */ new Set([
				"foundation-wall",
				"footing",
				"subfloor",
				"wall-sheathing",
				"roof-sheathing",
				"beam",
				"pad-footing"
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
	applyCanonical(mesh, c) {
		const [x, y, z] = c.geometry.center;
		const [sx, sy, sz] = c.geometry.size;
		mesh.position.set(x, y, z);
		mesh.scale.set(sx, sy, sz);
		const r = c.geometry.rotation;
		mesh.rotation.set(r?.[0] ?? 0, r?.[1] ?? 0, r?.[2] ?? 0);
	}
	sync(state) {
		this.snapshot = state;
		const removed = new Set(state.removedIds);
		const hidden = new Set(state.hiddenIds);
		const isolated = state.isolatedIds ? new Set(state.isolatedIds) : null;
		const xrayTypes = /* @__PURE__ */ new Set([
			"wall-sheathing",
			"roof-sheathing",
			"subfloor",
			"site"
		]);
		this.renderer.clippingPlanes = state.sectionEnabled ? [this.clipPlane] : [];
		this.clipPlane.constant = state.sectionOffset;
		for (const [id, mesh] of this.meshes) {
			const c = state.graph.components[id];
			if (!c) continue;
			const visible = isStageVisible(c, state.constructionStage, removed) && !hidden.has(id);
			mesh.visible = visible;
			if (!visible) continue;
			const [x, y, z] = explodedCenter(state.graph, c, state.explodeAmount, state.explodeScope);
			mesh.position.set(x, y, z);
			const isIso = !isolated || isolated.has(id);
			const isXray = state.xray && xrayTypes.has(c.type);
			const base = materialFor(c.material.family, this.mats);
			if (!isIso || isXray) {
				mesh.material = this.mats.ghost;
				mesh.castShadow = false;
			} else mesh.material = base;
		}
		this.syncOutlines(state);
	}
	syncOutlines(state) {
		const want = /* @__PURE__ */ new Set();
		if (state.selectedId) want.add(state.selectedId);
		if (this.hoverId) want.add(this.hoverId);
		for (const id of state.checkHighlights) want.add(id);
		for (const [id, line] of this.outlines) if (!want.has(id)) {
			this.root.remove(line);
			line.geometry.dispose();
			this.outlines.delete(id);
		}
		for (const id of want) {
			const mesh = this.meshes.get(id);
			if (!mesh || !mesh.visible) continue;
			let line = this.outlines.get(id);
			if (!line) {
				const geo = new EdgesGeometry(this.unit);
				line = new LineSegments(geo, state.checkHighlights.includes(id) ? this.mats.issue : this.mats.selected);
				line.userData.id = id;
				this.root.add(line);
				this.outlines.set(id, line);
			}
			line.position.copy(mesh.position);
			line.rotation.copy(mesh.rotation);
			line.scale.copy(mesh.scale).multiplyScalar(1.01);
			line.material = state.checkHighlights.includes(id) ? this.mats.issue : this.mats.selected;
		}
	}
	pick(ev) {
		const rect = this.renderer.domElement.getBoundingClientRect();
		NDC.x = (ev.clientX - rect.left) / rect.width * 2 - 1;
		NDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
		RAY.setFromCamera(NDC, this.camera);
		return RAY.intersectObjects([...this.meshes.values()].filter((m) => m.visible), false)[0]?.object.userData.id ?? null;
	}
	bind(canvas) {
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
	fitHouse() {
		this.animateCamera(new Vector3(15.5, 8.6, 17.5), new Vector3(0, 1.35, 0));
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
		const pos = mesh.position.clone().add(new Vector3(dist * .7, dist * .45, dist * .8));
		this.animateCamera(pos, mesh.position.clone());
	}
	fitAssembly(id) {
		const box = new Box3();
		let any = false;
		for (const [cid, mesh] of this.meshes) {
			if (!belongsToAssembly(this.graph, cid, id)) continue;
			if (!mesh.visible) continue;
			box.expandByObject(mesh);
			any = true;
		}
		if (!any) return;
		const center = box.getCenter(new Vector3());
		const size = box.getSize(TMP);
		const dist = Math.max(size.x, size.y, size.z) * 1.8;
		this.animateCamera(center.clone().add(new Vector3(dist * .7, dist * .5, dist * .8)), center);
	}
	animateCamera(pos, target) {
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
		const step = (now) => {
			const t = Math.min(1, (now - t0) / dur);
			const e = 1 - (1 - t) ** 3;
			this.camera.position.lerpVectors(startP, pos, e);
			this.controls.target.lerpVectors(startT, target, e);
			this.controls.update();
			if (t < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}
	handleCameraCommand(cmd) {
		if (cmd === "reset" || cmd === "fit-house") this.fitHouse();
		if (cmd === "fit-selected") this.fitSelected();
	}
	resize() {
		const parent = this.renderer.domElement.parentElement;
		const w = parent?.clientWidth || window.innerWidth;
		const h = parent?.clientHeight || window.innerHeight;
		this.camera.aspect = w / Math.max(1, h);
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h, false);
	}
	tick() {
		if (this.disposed) return;
		const now = performance.now();
		const dt = Math.min((now - this.last) / 1e3, .1);
		this.last = now;
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.drawCalls = this.renderer.info.render.calls;
		this.frames += 1;
		this.fpsAcc += dt;
		if (this.fpsAcc >= .4) {
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
};
function Viewport() {
	const canvasRef = (0, import_react.useRef)(null);
	const labRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const state = useLab.getState();
		const lab = new HouseLab(canvas, state.graph, {
			onSelect: (id) => useLab.getState().dispatch({
				type: "SELECT_COMPONENT",
				id
			}),
			onHover: () => {}
		});
		labRef.current = lab;
		lab.sync(state);
		const unsub = useLab.subscribe((s) => {
			lab.sync(s);
			if (s.cameraCommand) lab.handleCameraCommand(s.cameraCommand);
		});
		const onResize = () => lab.resize();
		window.addEventListener("resize", onResize);
		const ro = new ResizeObserver(onResize);
		if (canvas.parentElement) ro.observe(canvas.parentElement);
		const probe = () => {
			window.__clove = {
				getState: () => {
					const s = useLab.getState();
					return {
						selectedId: s.selectedId,
						explodeAmount: s.explodeAmount,
						explodeScope: s.explodeScope,
						constructionStage: s.constructionStage,
						removedIds: s.removedIds,
						mode: s.mode,
						xray: s.xray,
						check: s.check?.map((r) => ({
							ruleId: r.ruleId,
							verdict: r.verdict
						})),
						graphId: s.graph.id,
						componentCount: Object.keys(s.graph.components).length
					};
				},
				fps: lab.fps,
				drawCalls: lab.drawCalls,
				dispatch: (cmd) => useLab.getState().dispatch(cmd),
				explodeSelection: () => useLab.getState().explodeSelection()
			};
		};
		probe();
		const iv = window.setInterval(probe, 500);
		return () => {
			window.clearInterval(iv);
			unsub();
			window.removeEventListener("resize", onResize);
			ro.disconnect();
			lab.dispose();
			labRef.current = null;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "lab-stage",
		"data-testid": "lab-stage",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "lab-canvas",
			"aria-label": "PEI demonstration house"
		})
	});
}
//#endregion
export { Viewport };
