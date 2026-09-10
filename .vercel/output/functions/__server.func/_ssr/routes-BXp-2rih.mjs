import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as Pause, i as Play, n as SkipForward, r as SkipBack } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BXp-2rih.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function checkGraphIntegrity(graph) {
	const issues = [];
	const { components } = graph;
	for (const root of graph.rootIds) if (!components[root]) issues.push({
		code: "missing-root",
		message: `Root ${root} missing`
	});
	for (const a of graph.assemblies) if (!components[a]) issues.push({
		code: "missing-assembly",
		message: `Assembly ${a} missing`
	});
	for (const [id, c] of Object.entries(components)) {
		if (c.id !== id) issues.push({
			code: "id-mismatch",
			message: `Key ${id} != component.id ${c.id}`,
			componentId: id
		});
		if (c.parentId) {
			const p = components[c.parentId];
			if (!p) issues.push({
				code: "missing-parent",
				message: `${id} parent ${c.parentId} missing`,
				componentId: id
			});
			else if (!p.childIds.includes(id)) issues.push({
				code: "parent-child",
				message: `${id} not listed on parent ${c.parentId}`,
				componentId: id
			});
		}
		for (const childId of c.childIds) {
			const child = components[childId];
			if (!child) issues.push({
				code: "missing-child",
				message: `${id} child ${childId} missing`,
				componentId: id
			});
			else if (child.parentId !== id) issues.push({
				code: "child-parent",
				message: `${childId} parentId is ${child.parentId}, expected ${id}`,
				componentId: childId
			});
		}
		for (const dep of c.assembly.dependencies) if (!components[dep]) issues.push({
			code: "missing-dependency",
			message: `${id} depends on missing ${dep}`,
			componentId: id
		});
		checkRefs(c, "supportedBy", issues, components);
		checkRefs(c, "supports", issues, components);
	}
	return issues;
}
function checkRefs(c, field, issues, components) {
	const refs = c.structural?.[field];
	if (!refs) return;
	for (const ref of refs) if (!components[ref]) issues.push({
		code: "missing-structural-ref",
		message: `${c.id}.${field} → missing ${ref}`,
		componentId: c.id
	});
}
function descendants(graph, id) {
	const out = [];
	const stack = [...graph.components[id]?.childIds ?? []];
	while (stack.length) {
		const next = stack.pop();
		out.push(next);
		const kids = graph.components[next]?.childIds;
		if (kids) stack.push(...kids);
	}
	return out;
}
function belongsToAssembly(graph, componentId, assemblyId) {
	if (componentId === assemblyId) return true;
	let cur = componentId;
	const guard = /* @__PURE__ */ new Set();
	while (cur) {
		if (cur === assemblyId) return true;
		if (guard.has(cur)) break;
		guard.add(cur);
		const c = graph.components[cur];
		if (!c) break;
		if (c.assembly.explodeGroup === assemblyId) return true;
		cur = c.parentId;
	}
	return false;
}
var MAT = {
	soil: {
		id: "soil",
		label: "Site soil (demonstration)",
		family: "soil"
	},
	fill: {
		id: "excavation",
		label: "Excavated ground",
		family: "soil"
	},
	grass: {
		id: "grade",
		label: "Finished grade (simplified)",
		family: "context"
	},
	concrete: {
		id: "concrete",
		label: "Cast-in-place concrete",
		family: "concrete"
	},
	wood: {
		id: "spf",
		label: "SPF dimensional lumber (grade unspecified)",
		family: "wood"
	},
	treated: {
		id: "sill-treated",
		label: "Sill plate (preservative-treated, grade unspecified)",
		family: "wood-treated"
	},
	osb: {
		id: "osb",
		label: "Wood structural panel (OSB, demonstration)",
		family: "sheathing"
	},
	brace: {
		id: "temp-wood",
		label: "Temporary construction brace",
		family: "wood"
	}
};
var PROV_MODEL = {
	jurisdiction: "ca-pei",
	status: "demo-only",
	authority: "PROJECT_MODEL_ASSUMPTION"
};
var PROV_EDU = {
	jurisdiction: "ca-pei",
	status: "demo-only",
	authority: "EDUCATIONAL_DEMO_RULE"
};
/** Nominal dimensional lumber, dressed metric sizes used in the specimen. */
var LUMBER = {
	"2x4": {
		t: .038,
		d: .089,
		label: "38 × 89 mm (2×4)"
	},
	"2x6": {
		t: .038,
		d: .14,
		label: "38 × 140 mm (2×6)"
	},
	"2x8": {
		t: .038,
		d: .184,
		label: "38 × 184 mm (2×8)"
	},
	"2x10": {
		t: .038,
		d: .235,
		label: "38 × 235 mm (2×10)"
	},
	"2x12": {
		t: .038,
		d: .286,
		label: "38 × 286 mm (2×12)"
	},
	"4x4": {
		t: .089,
		d: .089,
		label: "89 × 89 mm (4×4)"
	},
	"6x6": {
		t: .14,
		d: .14,
		label: "140 × 140 mm (6×6)"
	}
};
var SHEATHING_OSB = .012;
var SUBFLOOR = .018;
var CONCRETE_WALL = .2;
var FOOTING_T = .2;
var FOOTING_W = .6;
/** Demonstration dimensions. Not implied regulatory minima. */
var SPECIMEN_ID = "PEI-PART9-DEMO-001";
var SPECIMEN_VERSION = "0.1.0";
var PROJECT_DATE = "2026-09-10";
var P = {
	length: 9.6,
	width: 7.2,
	grade: 0,
	excavDepth: 2.7,
	footingT: FOOTING_T,
	footingW: FOOTING_W,
	fdnT: CONCRETE_WALL,
	fdnAboveGrade: .3,
	studOc: .406,
	joistOc: .406,
	rafterOc: .406,
	pitch: 6 / 12,
	overhang: .45,
	plate: LUMBER["2x6"].t,
	stud: LUMBER["2x6"],
	joist: LUMBER["2x10"],
	header: LUMBER["2x10"],
	rafter: LUMBER["2x8"],
	ridge: LUMBER["2x10"],
	post: LUMBER["6x6"],
	sheathing: SHEATHING_OSB,
	subfloor: SUBFLOOR,
	wallStudH: 2.362
};
var halfL = P.length / 2;
var halfW = P.width / 2;
var Y = (() => {
	const excavBottom = P.grade - P.excavDepth;
	const footingTop = excavBottom + P.footingT;
	const fdnTop = P.grade + P.fdnAboveGrade;
	const sillTop = fdnTop + P.plate;
	const joistTop = sillTop + P.joist.d;
	const floorTop = joistTop + P.subfloor;
	const bottomPlateTop = floorTop + P.plate;
	const studTop = bottomPlateTop + P.wallStudH;
	const wallTop = studTop + P.plate * 2;
	return {
		excavBottom,
		footingTop,
		fdnTop,
		sillTop,
		joistTop,
		floorTop,
		bottomPlateTop,
		studTop,
		wallTop,
		ridgeY: wallTop + halfW * P.pitch
	};
})();
var ALPHA = Math.atan(P.pitch);
var learn$3 = (short, purpose, failureModes = []) => ({
	shortDescription: short,
	purpose,
	failureModes,
	claimCategory: "educational-simplification"
});
function addFloor(reg) {
	const A = "assembly.floor";
	reg.add({
		id: A,
		type: "assembly",
		label: "Floor system",
		geometry: {
			kind: "group",
			center: [
				0,
				(Y.sillTop + Y.floorTop) / 2,
				0
			],
			size: [
				P.length,
				.4,
				P.width
			]
		},
		material: MAT.wood,
		assembly: {
			stage: 6,
			dependencies: ["sill.front"],
			explodeGroup: A,
			explodeVector: [
				0,
				0,
				0
			],
			localExplodeVector: [
				0,
				0,
				0
			]
		},
		learning: learn$3("Joists, rims, a center beam and subfloor that make the main floor deck.", "Carry occupant and wall loads to the foundation and posts."),
		provenance: PROV_MODEL
	});
	const t = P.joist.t;
	const d = P.joist.d;
	const beamT = t * 3;
	const joistY = (Y.sillTop + Y.joistTop) / 2;
	reg.add({
		id: "beam.center",
		type: "beam",
		label: "Center built-up beam (3-ply 2×10)",
		parentId: A,
		geometry: {
			kind: "box",
			center: [
				0,
				joistY,
				0
			],
			size: [
				P.length - .35,
				d,
				beamT
			]
		},
		material: MAT.wood,
		assembly: {
			stage: 6,
			dependencies: [
				"post.1",
				"post.2",
				"sill.left"
			],
			explodeGroup: A,
			explodeVector: [
				0,
				.45,
				0
			],
			localExplodeVector: [
				0,
				.55,
				0
			]
		},
		structural: {
			loadPathRole: "main-beam",
			supportedBy: ["post.1", "post.2"],
			required: true
		},
		learning: learn$3("A built-up wood beam down the middle of the house.", "Halve the joist span. Ply count here is a demonstration choice, not a span-table result."),
		provenance: PROV_MODEL,
		tags: ["floor", "beam"]
	});
	const rims = [
		{
			id: "rim.front",
			c: [
				0,
				joistY,
				halfW - t / 2
			],
			s: [
				P.length,
				d,
				t
			],
			v: [
				0,
				.5,
				.45
			],
			dep: "sill.front"
		},
		{
			id: "rim.back",
			c: [
				0,
				joistY,
				-halfW + t / 2
			],
			s: [
				P.length,
				d,
				t
			],
			v: [
				0,
				.5,
				-.45
			],
			dep: "sill.back"
		},
		{
			id: "rim.left",
			c: [
				-halfL + t / 2,
				joistY,
				0
			],
			s: [
				t,
				d,
				P.width - 2 * t
			],
			v: [
				-.45,
				.5,
				0
			],
			dep: "sill.left"
		},
		{
			id: "rim.right",
			c: [
				halfL - t / 2,
				joistY,
				0
			],
			s: [
				t,
				d,
				P.width - 2 * t
			],
			v: [
				.45,
				.5,
				0
			],
			dep: "sill.right"
		}
	];
	for (const r of rims) reg.add({
		id: r.id,
		type: "rim-joist",
		label: `Rim joist (${r.id.split(".")[1]})`,
		parentId: A,
		geometry: {
			kind: "box",
			center: r.c,
			size: r.s
		},
		material: MAT.wood,
		assembly: {
			stage: 6,
			dependencies: [r.dep, "beam.center"],
			explodeGroup: A,
			explodeVector: r.v,
			localExplodeVector: r.v
		},
		structural: {
			loadPathRole: "rim",
			supportedBy: [r.dep],
			required: true
		},
		learning: learn$3("Closes the floor joist bays and ties the deck together at the edge.", "Provide a nailing edge for subfloor and a place for the wall to sit."),
		provenance: PROV_MODEL,
		tags: ["floor"]
	});
	const southLen = halfW - t - beamT / 2;
	const southZ = beamT / 2 + southLen / 2;
	const northZ = -southZ;
	let n = 0;
	for (let x = -halfL + t + .05; x <= halfL - t - .05 + 1e-9; x += P.joistOc) {
		const i = String(n).padStart(2, "0");
		for (const side of [{
			id: `joist.s.${i}`,
			z: southZ,
			rim: "rim.front"
		}, {
			id: `joist.n.${i}`,
			z: northZ,
			rim: "rim.back"
		}]) {
			const spread = x / halfL * .35;
			reg.add({
				id: side.id,
				type: "floor-joist",
				label: `Floor joist ${side.id}`,
				parentId: A,
				geometry: {
					kind: "box",
					center: [
						x,
						joistY,
						side.z
					],
					size: [
						t,
						d,
						southLen
					]
				},
				material: MAT.wood,
				assembly: {
					stage: 6,
					dependencies: ["beam.center", side.rim],
					explodeGroup: A,
					explodeVector: [
						spread,
						.6,
						side.z > 0 ? .25 : -.25
					],
					localExplodeVector: [
						spread * 1.4,
						.25,
						side.z > 0 ? .4 : -.4
					]
				},
				structural: {
					loadPathRole: "joist",
					supportedBy: ["beam.center", side.rim],
					required: true
				},
				learning: learn$3("A repeating floor member spanning from rim to center beam.", "Carry floor loads to the beam and foundation. Spacing is a demonstration parameter (16″ o.c.)."),
				provenance: {
					...PROV_MODEL,
					ruleIds: ["DEMO-LOADPATH-001"]
				},
				tags: ["floor", "joist"]
			});
		}
		n += 1;
	}
	const subY = (Y.joistTop + Y.floorTop) / 2;
	const sheetsX = 3;
	const sheetsZ = 2;
	const sx = P.length / sheetsX;
	const sz = P.width / sheetsZ;
	let k = 0;
	for (let ix = 0; ix < sheetsX; ix++) for (let iz = 0; iz < sheetsZ; iz++) {
		const x = -halfL + sx * (ix + .5);
		const z = -halfW + sz * (iz + .5);
		const id = `subfloor.${k}`;
		reg.add({
			id,
			type: "subfloor",
			label: `Subfloor panel ${k + 1}`,
			parentId: A,
			geometry: {
				kind: "box",
				center: [
					x,
					subY,
					z
				],
				size: [
					sx - .004,
					P.subfloor,
					sz - .004
				]
			},
			material: MAT.osb,
			assembly: {
				stage: 7,
				dependencies: ["joist.s.00", "joist.n.00"],
				explodeGroup: A,
				explodeVector: [
					0,
					.95,
					0
				],
				localExplodeVector: [
					0,
					.7,
					0
				]
			},
			structural: {
				loadPathRole: "diaphragm",
				supportedBy: ["joist.s.00"],
				required: true
			},
			learning: learn$3("Wood panels that make a walking surface and tie the joists into a diaphragm.", "Give walls a deck to stand on and spread point loads among joists."),
			provenance: PROV_MODEL,
			tags: ["floor", "sheathing"]
		});
		k += 1;
	}
}
var learn$2 = (short, purpose, failureModes = []) => ({
	shortDescription: short,
	purpose,
	failureModes,
	claimCategory: "educational-simplification"
});
function addFoundation(reg) {
	const A = "assembly.foundation";
	reg.add({
		id: A,
		type: "assembly",
		label: "Foundation assembly",
		geometry: {
			kind: "group",
			center: [
				0,
				-1.1,
				0
			],
			size: [
				P.length + 1,
				3.2,
				P.width + 1
			]
		},
		material: MAT.concrete,
		assembly: {
			stage: 3,
			dependencies: [],
			explodeGroup: A,
			explodeVector: [
				0,
				0,
				0
			],
			localExplodeVector: [
				0,
				0,
				0
			]
		},
		learning: learn$2("Concrete footing and basement walls that carry the wood house to soil.", "Create a stable, level base and a frost-protected stem for the wood frame."),
		provenance: PROV_MODEL
	});
	const soilY = Y.excavBottom - .08;
	const pitX = P.length + 1;
	const pitZ = P.width + 1;
	const ring = 14;
	const slabs = [
		{
			id: "site.grade.n",
			c: [
				0,
				P.grade - .04,
				(pitZ + ring) / 2
			],
			s: [
				pitX + 28,
				.08,
				ring
			]
		},
		{
			id: "site.grade.s",
			c: [
				0,
				P.grade - .04,
				-(pitZ + ring) / 2
			],
			s: [
				pitX + 28,
				.08,
				ring
			]
		},
		{
			id: "site.grade.e",
			c: [
				(pitX + ring) / 2,
				P.grade - .04,
				0
			],
			s: [
				ring,
				.08,
				pitZ
			]
		},
		{
			id: "site.grade.w",
			c: [
				-(pitX + ring) / 2,
				P.grade - .04,
				0
			],
			s: [
				ring,
				.08,
				pitZ
			]
		}
	];
	for (const sl of slabs) reg.add({
		id: sl.id,
		type: "site",
		label: "Finished grade",
		parentId: A,
		geometry: {
			kind: "box",
			center: sl.c,
			size: sl.s
		},
		material: MAT.grass,
		assembly: {
			stage: 1,
			dependencies: [],
			explodeGroup: A,
			explodeVector: [
				0,
				-.15,
				0
			],
			localExplodeVector: [
				0,
				-.15,
				0
			]
		},
		learning: learn$2("The reference plane. Everything else is measured from grade.", "Give the house a ground to sit in and a height to measure from."),
		provenance: PROV_MODEL,
		tags: ["site"]
	});
	reg.add({
		id: "exc.floor",
		type: "excavation",
		label: "Excavation floor",
		parentId: A,
		geometry: {
			kind: "box",
			center: [
				0,
				soilY,
				0
			],
			size: [
				pitX,
				.16,
				pitZ
			]
		},
		material: MAT.fill,
		assembly: {
			stage: 2,
			dependencies: [],
			explodeGroup: A,
			explodeVector: [
				0,
				-2.4,
				0
			],
			localExplodeVector: [
				0,
				-.8,
				0
			]
		},
		learning: learn$2("The pit the footings sit in. Depth here is a demonstration value, not a frost-depth determination.", "Reach below the footing and give working room around the walls."),
		provenance: PROV_MODEL
	});
	const wallH = .16 + (P.grade - Y.excavBottom);
	const pitHalfX = pitX / 2;
	const pitHalfZ = pitZ / 2;
	const walls = [
		{
			id: "exc.wall.n",
			c: [
				0,
				(P.grade + Y.excavBottom) / 2,
				pitHalfZ
			],
			s: [
				pitX,
				wallH,
				.12
			]
		},
		{
			id: "exc.wall.s",
			c: [
				0,
				(P.grade + Y.excavBottom) / 2,
				-pitHalfZ
			],
			s: [
				pitX,
				wallH,
				.12
			]
		},
		{
			id: "exc.wall.e",
			c: [
				pitHalfX,
				(P.grade + Y.excavBottom) / 2,
				0
			],
			s: [
				.12,
				wallH,
				pitZ
			]
		},
		{
			id: "exc.wall.w",
			c: [
				-pitHalfX,
				(P.grade + Y.excavBottom) / 2,
				0
			],
			s: [
				.12,
				wallH,
				pitZ
			]
		}
	];
	for (const w of walls) reg.add({
		id: w.id,
		type: "excavation",
		label: "Excavation face",
		parentId: A,
		geometry: {
			kind: "box",
			center: w.c,
			size: w.s
		},
		material: MAT.fill,
		assembly: {
			stage: 2,
			dependencies: ["exc.floor"],
			explodeGroup: A,
			explodeVector: [
				0,
				-2.2,
				0
			],
			localExplodeVector: [
				0,
				-.7,
				0
			],
			untilStage: 5
		},
		learning: learn$2("Cut soil around the future foundation.", "Create space for formwork, drainage, and the footing projection."),
		provenance: PROV_MODEL
	});
	const ftgY = (Y.excavBottom + Y.footingTop) / 2;
	const extra = (P.footingW - P.fdnT) / 2;
	const strips = [
		{
			id: "ftg.front",
			label: "Front strip footing",
			c: [
				0,
				ftgY,
				halfW - P.fdnT / 2
			],
			s: [
				P.length + extra * 2,
				P.footingT,
				P.footingW
			],
			v: [
				0,
				-1.6,
				.6
			]
		},
		{
			id: "ftg.back",
			label: "Back strip footing",
			c: [
				0,
				ftgY,
				-halfW + P.fdnT / 2
			],
			s: [
				P.length + extra * 2,
				P.footingT,
				P.footingW
			],
			v: [
				0,
				-1.6,
				-.6
			]
		},
		{
			id: "ftg.left",
			label: "Left strip footing",
			c: [
				-halfL + P.fdnT / 2,
				ftgY,
				0
			],
			s: [
				P.footingW,
				P.footingT,
				P.width - P.fdnT
			],
			v: [
				-.6,
				-1.6,
				0
			]
		},
		{
			id: "ftg.right",
			label: "Right strip footing",
			c: [
				halfL - P.fdnT / 2,
				ftgY,
				0
			],
			s: [
				P.footingW,
				P.footingT,
				P.width - P.fdnT
			],
			v: [
				.6,
				-1.6,
				0
			]
		}
	];
	for (const f of strips) reg.add({
		id: f.id,
		type: "footing",
		label: f.label,
		parentId: A,
		geometry: {
			kind: "box",
			center: f.c,
			size: f.s
		},
		material: MAT.concrete,
		assembly: {
			stage: 3,
			dependencies: ["exc.floor"],
			explodeGroup: A,
			explodeVector: f.v,
			localExplodeVector: [
				f.v[0] * .4,
				f.v[1] * .4,
				f.v[2] * .4
			]
		},
		structural: {
			loadPathRole: "spread-foundation-load",
			required: true
		},
		learning: learn$2("A wider concrete strip under the wall so soil pressure stays low.", "Spread wall and house loads onto the ground."),
		provenance: PROV_MODEL
	});
	const pads = [{
		id: "pad.1",
		x: -2.4
	}, {
		id: "pad.2",
		x: 2.4
	}];
	for (const p of pads) reg.add({
		id: p.id,
		type: "pad-footing",
		label: `Interior pad footing ${p.id.slice(-1)}`,
		parentId: A,
		geometry: {
			kind: "box",
			center: [
				p.x,
				ftgY,
				0
			],
			size: [
				.8,
				P.footingT,
				.8
			]
		},
		material: MAT.concrete,
		assembly: {
			stage: 3,
			dependencies: ["exc.floor"],
			explodeGroup: A,
			explodeVector: [
				0,
				-1.5,
				0
			],
			localExplodeVector: [
				0,
				-.5,
				0
			]
		},
		structural: {
			loadPathRole: "spread-post-load",
			supports: [`post.${p.id.slice(-1)}`],
			required: true
		},
		learning: learn$2("A pad under each basement post.", "Take concentrated post loads into the soil."),
		provenance: PROV_MODEL
	});
	const fdnY = (Y.footingTop + Y.fdnTop) / 2;
	const fdnH = Y.fdnTop - Y.footingTop;
	const fdn = [
		{
			id: "fdn.front",
			label: "Front foundation wall",
			c: [
				0,
				fdnY,
				halfW - P.fdnT / 2
			],
			s: [
				P.length,
				fdnH,
				P.fdnT
			],
			v: [
				0,
				-.7,
				.35
			],
			ftg: "ftg.front"
		},
		{
			id: "fdn.back",
			label: "Back foundation wall",
			c: [
				0,
				fdnY,
				-halfW + P.fdnT / 2
			],
			s: [
				P.length,
				fdnH,
				P.fdnT
			],
			v: [
				0,
				-.7,
				-.35
			],
			ftg: "ftg.back"
		},
		{
			id: "fdn.left",
			label: "Left foundation wall",
			c: [
				-halfL + P.fdnT / 2,
				fdnY,
				0
			],
			s: [
				P.fdnT,
				fdnH,
				P.width - 2 * P.fdnT
			],
			v: [
				-.35,
				-.7,
				0
			],
			ftg: "ftg.left"
		},
		{
			id: "fdn.right",
			label: "Right foundation wall",
			c: [
				halfL - P.fdnT / 2,
				fdnY,
				0
			],
			s: [
				P.fdnT,
				fdnH,
				P.width - 2 * P.fdnT
			],
			v: [
				.35,
				-.7,
				0
			],
			ftg: "ftg.right"
		}
	];
	for (const w of fdn) reg.add({
		id: w.id,
		type: "foundation-wall",
		label: w.label,
		parentId: A,
		geometry: {
			kind: "box",
			center: w.c,
			size: w.s
		},
		material: MAT.concrete,
		assembly: {
			stage: 4,
			dependencies: [w.ftg],
			explodeGroup: A,
			explodeVector: w.v,
			localExplodeVector: w.v
		},
		structural: {
			loadPathRole: "stem-wall",
			supportedBy: [w.ftg],
			required: true
		},
		learning: learn$2("The basement wall. It holds back soil and carries the wood frame.", "Lift the wood structure to grade and enclose the basement."),
		provenance: PROV_MODEL
	});
	const beamBottom = Y.sillTop;
	const postH = beamBottom - Y.footingTop;
	const postY = (Y.footingTop + beamBottom) / 2;
	for (const p of pads) {
		const n = p.id.slice(-1);
		const id = `post.${n}`;
		reg.add({
			id,
			type: "column",
			label: `Basement post ${n}`,
			parentId: A,
			geometry: {
				kind: "box",
				center: [
					p.x,
					postY,
					0
				],
				size: [
					P.post.t,
					postH,
					P.post.d
				]
			},
			material: MAT.wood,
			assembly: {
				stage: 4,
				dependencies: [p.id],
				explodeGroup: A,
				explodeVector: [
					0,
					.2,
					0
				],
				localExplodeVector: [
					0,
					.35,
					0
				]
			},
			structural: {
				loadPathRole: "interior-post",
				supportedBy: [p.id],
				supports: ["beam.center"],
				required: true
			},
			learning: learn$2("A wood post carrying the center beam down to a pad.", "Shorten the floor-joist span by supporting the beam."),
			provenance: PROV_MODEL
		});
	}
	const sills = [
		{
			id: "sill.front",
			c: [
				0,
				(Y.fdnTop + Y.sillTop) / 2,
				halfW - P.fdnT / 2
			],
			s: [
				P.length - .08,
				P.plate,
				P.stud.d
			],
			v: [
				0,
				-.25,
				.2
			],
			fdn: "fdn.front"
		},
		{
			id: "sill.back",
			c: [
				0,
				(Y.fdnTop + Y.sillTop) / 2,
				-halfW + P.fdnT / 2
			],
			s: [
				P.length - .08,
				P.plate,
				P.stud.d
			],
			v: [
				0,
				-.25,
				-.2
			],
			fdn: "fdn.back"
		},
		{
			id: "sill.left",
			c: [
				-halfL + P.fdnT / 2,
				(Y.fdnTop + Y.sillTop) / 2,
				0
			],
			s: [
				P.stud.d,
				P.plate,
				P.width - .4
			],
			v: [
				-.2,
				-.25,
				0
			],
			fdn: "fdn.left"
		},
		{
			id: "sill.right",
			c: [
				halfL - P.fdnT / 2,
				(Y.fdnTop + Y.sillTop) / 2,
				0
			],
			s: [
				P.stud.d,
				P.plate,
				P.width - .4
			],
			v: [
				.2,
				-.25,
				0
			],
			fdn: "fdn.right"
		}
	];
	for (const s of sills) reg.add({
		id: s.id,
		type: "sill-plate",
		label: `Sill plate (${s.id.split(".")[1]})`,
		parentId: A,
		geometry: {
			kind: "box",
			center: s.c,
			size: s.s
		},
		material: MAT.treated,
		assembly: {
			stage: 5,
			dependencies: [s.fdn],
			explodeGroup: A,
			explodeVector: s.v,
			localExplodeVector: s.v
		},
		structural: {
			loadPathRole: "sill",
			supportedBy: [s.fdn],
			required: true
		},
		learning: learn$2("The first wood member. It is the transition from concrete to framing.", "Bolt the wood house down and give joists a bearing surface. Grade and treatment are not specified in this specimen."),
		provenance: {
			...PROV_MODEL,
			ruleIds: ["DEMO-SILL-001", "LUMBER-GRADE-001"]
		},
		tags: ["sill"]
	});
}
function createRegistry() {
	const components = {};
	function add(c) {
		const comp = {
			...c,
			childIds: [...c.childIds ?? []],
			selectable: c.selectable ?? c.geometry.kind !== "group"
		};
		if (components[comp.id]) throw new Error(`Duplicate component id ${comp.id}`);
		components[comp.id] = comp;
		if (comp.parentId) {
			const p = components[comp.parentId];
			if (!p) throw new Error(`Parent ${comp.parentId} missing for ${comp.id}`);
			if (!p.childIds.includes(comp.id)) p.childIds.push(comp.id);
		}
		return comp;
	}
	return {
		components,
		add
	};
}
var learn$1 = (short, purpose, failureModes = []) => ({
	shortDescription: short,
	purpose,
	failureModes,
	claimCategory: "educational-simplification"
});
function addRoof(reg) {
	const A = "assembly.roof";
	const run = halfW + P.overhang;
	const rise = run * P.pitch;
	const rafterLen = Math.hypot(run, rise);
	const tailY = Y.wallTop - P.overhang * P.pitch;
	const southZ = run / 2;
	const northZ = -southZ;
	const southY = (Y.ridgeY + tailY) / 2;
	const northY = southY;
	reg.add({
		id: A,
		type: "assembly",
		label: "Roof assembly",
		geometry: {
			kind: "group",
			center: [
				0,
				(Y.wallTop + Y.ridgeY) / 2,
				0
			],
			size: [
				P.length + 1,
				rise + .4,
				P.width + P.overhang * 2
			]
		},
		material: MAT.wood,
		assembly: {
			stage: 11,
			dependencies: ["assembly.wall.front"],
			explodeGroup: A,
			explodeVector: [
				0,
				0,
				0
			],
			localExplodeVector: [
				0,
				0,
				0
			]
		},
		learning: learn$1("A simple gable roof: ridge, rafters, ties and sheathing.", "Carry snow and wind (not numerically modelled) to the exterior walls."),
		provenance: PROV_MODEL
	});
	const ridgeH = P.ridge.d;
	const ridgeT = P.ridge.t;
	reg.add({
		id: "roof.ridge",
		type: "ridge",
		label: "Ridge board",
		parentId: A,
		geometry: {
			kind: "box",
			center: [
				0,
				Y.ridgeY - ridgeH / 2,
				0
			],
			size: [
				P.length + .2,
				ridgeH,
				ridgeT
			]
		},
		material: MAT.wood,
		assembly: {
			stage: 11,
			dependencies: ["assembly.wall.front"],
			explodeGroup: A,
			explodeVector: [
				0,
				2.6,
				0
			],
			localExplodeVector: [
				0,
				.8,
				0
			]
		},
		structural: {
			loadPathRole: "ridge",
			required: true
		},
		learning: learn$1("The board at the peak where opposite rafters meet.", "Align rafters. It is not modelled as a girder in this specimen."),
		provenance: PROV_MODEL,
		tags: ["roof"]
	});
	let i = 0;
	for (let x = -halfL + .05; x <= halfL - .05 + 1e-9; x += P.rafterOc) {
		const idx = String(i).padStart(2, "0");
		const spread = x / halfL * .2;
		addRafter(reg, A, `rafter.s.${idx}`, x, southY, southZ, rafterLen, ALPHA, [
			spread,
			2.3,
			.55
		]);
		addRafter(reg, A, `rafter.n.${idx}`, x, northY, northZ, rafterLen, -ALPHA, [
			spread,
			2.3,
			-.55
		]);
		if (i % 3 === 0) {
			const cY = Y.wallTop + (Y.ridgeY - Y.wallTop) * .55;
			const cLen = halfW * .9;
			reg.add({
				id: `roof.collar.${idx}`,
				type: "collar-tie",
				label: `Collar tie ${idx}`,
				parentId: A,
				geometry: {
					kind: "box",
					center: [
						x,
						cY,
						0
					],
					size: [
						P.rafter.t,
						P.rafter.t,
						cLen
					]
				},
				material: MAT.wood,
				assembly: {
					stage: 11,
					dependencies: [`rafter.s.${idx}`, `rafter.n.${idx}`],
					explodeGroup: A,
					explodeVector: [
						spread,
						2.1,
						0
					],
					localExplodeVector: [
						0,
						.35,
						0
					]
				},
				structural: {
					loadPathRole: "collar-tie",
					supportedBy: [`rafter.s.${idx}`, `rafter.n.${idx}`]
				},
				learning: learn$1("A tie between a pair of rafters, high in the attic.", "Help keep the pair from spreading. Placement here is a common method, not a code quote."),
				provenance: PROV_MODEL,
				tags: ["roof"]
			});
		}
		i += 1;
	}
	let j = 0;
	for (let x = -halfL + .12; x <= halfL - .12 + 1e-9; x += P.joistOc) {
		const idx = String(j).padStart(2, "0");
		const cjY = Y.wallTop - P.joist.t / 2;
		reg.add({
			id: `roof.ceiling.${idx}`,
			type: "ceiling-joist",
			label: `Ceiling joist / rafter tie ${idx}`,
			parentId: A,
			geometry: {
				kind: "box",
				center: [
					x,
					cjY,
					0
				],
				size: [
					P.joist.t,
					P.joist.t,
					P.width - .1
				]
			},
			material: MAT.wood,
			assembly: {
				stage: 11,
				dependencies: ["assembly.wall.front", "assembly.wall.back"],
				explodeGroup: A,
				explodeVector: [
					x / halfL * .15,
					1.85,
					0
				],
				localExplodeVector: [
					0,
					.2,
					0
				]
			},
			structural: {
				loadPathRole: "rafter-tie",
				required: true
			},
			learning: learn$1("Joists that also keep the exterior walls from spreading under rafter thrust.", "Tie the eave walls together at plate level."),
			provenance: PROV_MODEL,
			tags: ["roof"]
		});
		j += 1;
	}
	addGableStuds(reg, A, "left", -1);
	addGableStuds(reg, A, "right", 1);
	const sheetAlong = (P.length + .3) / 3;
	const sheetRun = rafterLen;
	for (const side of [{
		tag: "s",
		z: southZ,
		y: southY,
		rot: ALPHA
	}, {
		tag: "n",
		z: northZ,
		y: northY,
		rot: -ALPHA
	}]) for (let k = 0; k < 3; k++) {
		const x = -halfL - .15 + sheetAlong * (k + .5);
		reg.add({
			id: `roof.sheathing.${side.tag}.${k}`,
			type: "roof-sheathing",
			label: `Roof sheathing ${side.tag.toUpperCase()}${k + 1}`,
			parentId: A,
			geometry: {
				kind: "box",
				center: [
					x,
					side.y + .08,
					side.z
				],
				size: [
					sheetAlong - .01,
					P.sheathing,
					sheetRun
				],
				rotation: [
					side.rot,
					0,
					0
				]
			},
			material: MAT.osb,
			assembly: {
				stage: 12,
				dependencies: ["roof.ridge", "rafter.s.00"],
				explodeGroup: A,
				explodeVector: [
					0,
					3.15,
					side.z > 0 ? .3 : -.3
				],
				localExplodeVector: [
					0,
					.55,
					side.z > 0 ? .35 : -.35
				]
			},
			structural: { loadPathRole: "roof-diaphragm" },
			learning: learn$1("Wood panels on the rafters.", "Make a deck for future roofing and brace the rafters. Roofing is not in v0.1."),
			provenance: {
				...PROV_MODEL,
				ruleIds: ["NBC-SNOW-001"]
			},
			tags: ["roof", "sheathing"]
		});
	}
}
function addRafter(reg, A, id, x, y, z, len, rot, explode) {
	const t = P.rafter.t;
	const d = P.rafter.d;
	reg.add({
		id,
		type: "rafter",
		label: `Rafter ${id.replace("rafter.", "")}`,
		parentId: A,
		geometry: {
			kind: "box",
			center: [
				x,
				y,
				z
			],
			size: [
				t,
				d,
				len
			],
			rotation: [
				rot,
				0,
				0
			]
		},
		material: MAT.wood,
		assembly: {
			stage: 11,
			dependencies: ["roof.ridge", "assembly.wall.front"],
			explodeGroup: A,
			explodeVector: explode,
			localExplodeVector: [
				explode[0] * .6,
				.4,
				explode[2]
			]
		},
		structural: {
			loadPathRole: "rafter",
			supportedBy: ["roof.ridge"],
			required: true
		},
		learning: learn$1("A sloping roof member from ridge to wall plate, with a short overhang.", "Carry roof loads to the exterior walls. Size and spacing are demonstration values — climatic snow load is not in this model."),
		provenance: {
			...PROV_MODEL,
			ruleIds: ["NBC-SNOW-001"]
		},
		tags: ["roof", "rafter"]
	});
}
function addGableStuds(reg, A, side, sign) {
	const x = sign * (halfL - P.stud.d / 2 - P.sheathing);
	let n = 0;
	for (let z = -halfW + .3; z <= halfW - .3 + 1e-9; z += P.studOc) {
		const peak = (halfW - Math.abs(z)) * P.pitch;
		if (peak < .18) continue;
		const h = peak;
		const y = Y.wallTop + h / 2;
		const id = `roof.gable.${side}.${n}`;
		reg.add({
			id,
			type: "gable-stud",
			label: `${cap$1(side)} gable stud ${n}`,
			parentId: A,
			geometry: {
				kind: "box",
				center: [
					x,
					y,
					z
				],
				size: [
					P.stud.d,
					h,
					P.stud.t
				]
			},
			material: MAT.wood,
			assembly: {
				stage: 11,
				dependencies: [`assembly.wall.${side}`],
				explodeGroup: A,
				explodeVector: [
					sign * 2.2,
					2,
					z * .08
				],
				localExplodeVector: [
					sign * .35,
					.25,
					0
				]
			},
			structural: { loadPathRole: "gable-stud" },
			learning: learn$1("Short studs that infill the triangular gable above the end-wall plates.", "Give the gable sheathing something to nail to."),
			provenance: PROV_MODEL,
			tags: ["roof", "gable"]
		});
		n += 1;
	}
}
function cap$1(s) {
	return s.slice(0, 1).toUpperCase() + s.slice(1);
}
var learn = (short, purpose, failureModes = []) => ({
	shortDescription: short,
	purpose,
	failureModes,
	claimCategory: "educational-simplification"
});
function wallGeom(key) {
	P.stud.t;
	P.stud.d;
	if (key === "front" || key === "back") {
		const sign = key === "front" ? 1 : -1;
		return {
			length: P.length,
			outward: [
				0,
				0,
				sign
			],
			lumber: (along, y, depth) => [
				along,
				y,
				depth
			],
			at: (s, inset) => ({
				x: s,
				z: sign * (halfW - inset)
			}),
			whole: [
				0,
				1.35,
				sign * 2.1
			]
		};
	}
	const sign = key === "right" ? 1 : -1;
	return {
		length: P.width,
		outward: [
			sign,
			0,
			0
		],
		lumber: (along, y, depth) => [
			depth,
			y,
			along
		],
		at: (s, inset) => ({
			x: sign * (halfL - inset),
			z: s
		}),
		whole: [
			sign * 2.1,
			1.35,
			0
		]
	};
}
function overlaps(s, t, openings) {
	const half = t / 2 + .002;
	for (const o of openings) {
		const kit = o.w / 2 + t * 2 + .01;
		if (s + half > o.s - kit && s - half < o.s + kit) return true;
	}
	return false;
}
function addWalls(reg) {
	for (const w of [
		{
			key: "front",
			openings: [
				{
					id: "D1",
					kind: "door",
					s: -2.55,
					w: .86,
					h: 2.03,
					sill: 0
				},
				{
					id: "W1",
					kind: "window",
					s: .2,
					w: 1.22,
					h: 1.2,
					sill: .9,
					challenge: true
				},
				{
					id: "W2",
					kind: "window",
					s: 2.75,
					w: 1.22,
					h: 1.2,
					sill: .9
				}
			]
		},
		{
			key: "back",
			openings: [{
				id: "W3",
				kind: "window",
				s: .15,
				w: 1.47,
				h: 1.2,
				sill: .9
			}]
		},
		{
			key: "left",
			openings: [{
				id: "W4",
				kind: "window",
				s: .4,
				w: 1.02,
				h: 1.2,
				sill: .9
			}]
		},
		{
			key: "right",
			openings: [{
				id: "W5",
				kind: "window",
				s: -.9,
				w: 1.02,
				h: 1.2,
				sill: .9
			}]
		}
	]) frameWall(reg, w.key, w.openings);
}
function frameWall(reg, key, openings) {
	const g = wallGeom(key);
	const A = `assembly.wall.${key}`;
	const t = P.stud.t;
	const d = P.stud.d;
	const plateH = P.plate;
	const studH = P.wallStudH;
	const sheathInset = P.sheathing / 2;
	const studInset = P.sheathing + d / 2;
	const plateInset = studInset;
	reg.add({
		id: A,
		type: "assembly",
		label: `${cap(key)} exterior wall`,
		parentId: void 0,
		geometry: {
			kind: "group",
			center: [
				0,
				(Y.floorTop + Y.wallTop) / 2,
				0
			],
			size: [
				g.length,
				Y.wallTop - Y.floorTop,
				.3
			]
		},
		material: MAT.wood,
		assembly: {
			stage: 8,
			dependencies: ["subfloor.0"],
			explodeGroup: A,
			explodeVector: g.whole,
			localExplodeVector: [
				0,
				0,
				0
			]
		},
		learning: learn(`Wood-framed ${key} wall with plates, studs and openings.`, "Carry roof and floor loads, define openings, and receive sheathing."),
		provenance: PROV_MODEL,
		tags: ["wall", key]
	});
	const bottomY = Y.floorTop + plateH / 2;
	const innerTopY = Y.studTop + plateH / 2;
	const outerTopY = Y.studTop + plateH + plateH / 2;
	const p0 = g.at(0, plateInset);
	for (const plate of [
		{
			id: `${A}.plate.bottom`,
			type: "bottom-plate",
			y: bottomY,
			label: `${cap(key)} bottom plate`,
			stage: 8
		},
		{
			id: `${A}.plate.top.inner`,
			type: "top-plate",
			y: innerTopY,
			label: `${cap(key)} inner top plate`,
			stage: 8
		},
		{
			id: `${A}.plate.top.outer`,
			type: "top-plate",
			y: outerTopY,
			label: `${cap(key)} outer top plate`,
			stage: 8
		}
	]) {
		const localY = plate.type === "bottom-plate" ? -.22 : .45;
		reg.add({
			id: plate.id,
			type: plate.type,
			label: plate.label,
			parentId: A,
			geometry: {
				kind: "box",
				center: [
					p0.x,
					plate.y,
					p0.z
				],
				size: g.lumber(g.length, plateH, d)
			},
			material: MAT.wood,
			assembly: {
				stage: plate.stage,
				dependencies: ["subfloor.0"],
				explodeGroup: A,
				explodeVector: g.whole,
				localExplodeVector: [
					g.outward[0] * .15,
					localY,
					g.outward[2] * .15
				]
			},
			structural: {
				loadPathRole: plate.type,
				required: true
			},
			learning: learn(plate.type === "bottom-plate" ? "Sits on the subfloor and receives every stud." : "A doubled top plate laps at corners and carries rafters or ceiling joists.", "Tie the wall into a single assembly."),
			provenance: PROV_MODEL,
			tags: ["wall", key]
		});
	}
	const studY = (Y.bottomPlateTop + Y.studTop) / 2;
	const start = -g.length / 2 + t / 2;
	const end = g.length / 2 - t / 2;
	let si = 0;
	for (let s = start; s <= end + 1e-9; s += P.studOc) {
		if (overlaps(s, t, openings)) continue;
		addStud(reg, key, g, A, `stud.${String(si).padStart(2, "0")}`, s, studY, studH, "common-stud", `${cap(key)} stud`, 8);
		si += 1;
	}
	if (!overlaps(end, t, openings)) addStud(reg, key, g, A, "stud.end", end, studY, studH, "common-stud", `${cap(key)} end stud`, 8);
	for (const o of openings) addOpening(reg, key, g, A, o, t, d, studInset);
	addSheathing(reg, key, g, A, openings, sheathInset);
}
function addStud(reg, key, g, A, suffix, s, y, h, type, label, stage, extra) {
	const t = P.stud.t;
	const d = P.stud.d;
	const inset = P.sheathing + d / 2;
	const p = g.at(s, inset);
	const spread = s / (g.length / 2 || 1) * .28;
	const along = g.outward[2] !== 0 ? [
		spread,
		.12,
		g.outward[2] * .45
	] : [
		g.outward[0] * .45,
		.12,
		spread
	];
	const id = `${A}.${suffix}`;
	reg.add({
		id,
		type,
		label,
		parentId: A,
		geometry: {
			kind: "box",
			center: [
				p.x,
				y,
				p.z
			],
			size: g.lumber(t, h, d)
		},
		material: MAT.wood,
		assembly: {
			stage,
			dependencies: [`${A}.plate.bottom`],
			explodeGroup: A,
			explodeVector: g.whole,
			localExplodeVector: along
		},
		structural: {
			loadPathRole: type,
			required: extra?.required ?? type !== "common-stud",
			supportedBy: extra?.supportedBy ?? [`${A}.plate.bottom`],
			supports: extra?.supports
		},
		learning: learn(...studCopy(type)),
		provenance: {
			...PROV_EDU,
			ruleIds: ["DEMO-LOADPATH-001"]
		},
		tags: [
			"wall",
			key,
			type,
			...extra?.tags ?? []
		]
	});
	return id;
}
function studCopy(type) {
	switch (type) {
		case "king-stud": return [
			"Full-height stud beside an opening. It is not the stud that carries the header.",
			"Stiffen the opening and nail the jack and header assembly.",
			["If removed, the jack loses its backing."]
		];
		case "jack-stud": return [
			"The trimmer. It bears the header and therefore the load over the opening.",
			"Carry header loads down to the bottom plate.",
			["Remove it and the header has nothing to sit on."]
		];
		case "cripple-stud": return [
			"A short stud above a header or below a window sill.",
			"Continue the stud layout so the plates stay supported.",
			["Gaps above a header leave the top plate unbacked."]
		];
		default: return [
			"A repeating wall stud. Demonstration spacing is 16″ o.c.",
			"Carry vertical load and give nailing for sheathing.",
			["Removing several in a row breaks the wall’s load path in this model."]
		];
	}
}
function addOpening(reg, key, g, A, o, t, d, studInset) {
	const left = o.s - o.w / 2;
	const right = o.s + o.w / 2;
	const jackL = left - t / 2;
	const kingL = left - t - t / 2;
	const jackR = right + t / 2;
	const kingR = right + t + t / 2;
	const headerBottom = Y.floorTop + o.sill + o.h;
	const headerH = P.header.d;
	const headerTop = headerBottom + headerH;
	const jackH = headerBottom - Y.bottomPlateTop;
	const jackY = Y.bottomPlateTop + jackH / 2;
	const kingH = P.wallStudH;
	const kingY = (Y.bottomPlateTop + Y.studTop) / 2;
	const tags = o.challenge ? ["challenge-window"] : [];
	const kingLId = addStud(reg, key, g, A, `king.${o.id}.L`, kingL, kingY, kingH, "king-stud", `${o.id} king stud L`, 9, {
		required: true,
		tags
	});
	const kingRId = addStud(reg, key, g, A, `king.${o.id}.R`, kingR, kingY, kingH, "king-stud", `${o.id} king stud R`, 9, {
		required: true,
		tags
	});
	const jackLId = addStud(reg, key, g, A, `jack.${o.id}.L`, jackL, jackY, jackH, "jack-stud", `${o.id} jack stud L`, 9, {
		required: true,
		supportedBy: [`${A}.plate.bottom`],
		tags
	});
	const jackRId = addStud(reg, key, g, A, `jack.${o.id}.R`, jackR, jackY, jackH, "jack-stud", `${o.id} jack stud R`, 9, {
		required: true,
		supportedBy: [`${A}.plate.bottom`],
		tags
	});
	const headerLen = o.w + t * 2;
	const headerY = headerBottom + headerH / 2;
	const hp = g.at(o.s, studInset);
	const headerId = `${A}.header.${o.id}`;
	const plyT = t * 2;
	reg.add({
		id: headerId,
		type: "header",
		label: `${o.id} header (2-ply 2×10, demonstration)`,
		parentId: A,
		geometry: {
			kind: "box",
			center: [
				hp.x,
				headerY,
				hp.z
			],
			size: g.lumber(headerLen, headerH, plyT)
		},
		material: MAT.wood,
		assembly: {
			stage: 9,
			dependencies: [jackLId, jackRId],
			explodeGroup: A,
			explodeVector: g.whole,
			localExplodeVector: [
				g.outward[0] * .2,
				.55,
				g.outward[2] * .2
			]
		},
		structural: {
			loadPathRole: "header",
			supportedBy: [jackLId, jackRId],
			required: true
		},
		learning: learn("The beam over the opening. In this lab it sits on the jack studs.", "Carry loads that would have gone through the missing studs. Size is a demonstration, not a span-table result.", ["Unsupported if either jack is removed."]),
		provenance: {
			...PROV_EDU,
			ruleIds: ["DEMO-OPENING-001"]
		},
		tags: [
			"wall",
			key,
			"header",
			...tags
		]
	});
	if (o.kind === "window") {
		const sillY = Y.floorTop + o.sill - t / 2;
		const sillId = `${A}.sill.${o.id}`;
		reg.add({
			id: sillId,
			type: "rough-sill",
			label: `${o.id} rough sill`,
			parentId: A,
			geometry: {
				kind: "box",
				center: [
					hp.x,
					sillY,
					hp.z
				],
				size: g.lumber(o.w, t, d)
			},
			material: MAT.wood,
			assembly: {
				stage: 9,
				dependencies: [jackLId, jackRId],
				explodeGroup: A,
				explodeVector: g.whole,
				localExplodeVector: [
					0,
					-.2,
					0
				]
			},
			structural: {
				loadPathRole: "rough-sill",
				supportedBy: [jackLId, jackRId]
			},
			learning: learn("The member at the bottom of the window rough opening.", "Support the window and receive cripple studs below."),
			provenance: PROV_MODEL,
			tags: [
				"wall",
				key,
				...tags
			]
		});
		const cripH = sillY - t / 2 - Y.bottomPlateTop;
		if (cripH > .08) {
			const cripY = Y.bottomPlateTop + cripH / 2;
			let ci = 0;
			for (let s = left + t; s < right - t; s += P.studOc) {
				addStud(reg, key, g, A, `cripple.below.${o.id}.${ci}`, s, cripY, cripH, "cripple-stud", `${o.id} sill cripple`, 9, { tags });
				ci += 1;
			}
		}
	}
	const aboveH = Y.studTop - headerTop;
	if (aboveH > .06) {
		const aboveY = headerTop + aboveH / 2;
		let ci = 0;
		for (let s = left + t; s < right - t; s += P.studOc) {
			addStud(reg, key, g, A, `cripple.above.${o.id}.${ci}`, s, aboveY, aboveH, "cripple-stud", `${o.id} head cripple`, 9, {
				supportedBy: [headerId],
				tags
			});
			ci += 1;
		}
	}
	if (o.challenge) {
		const braceLen = Math.hypot(o.w, o.h * .85);
		const braceY = Y.floorTop + o.sill + o.h * .45;
		const rot = g.outward[2] !== 0 ? [
			0,
			0,
			-Math.atan2(o.h * .85, o.w)
		] : [
			0,
			0,
			0
		];
		const rx = g.outward[0] !== 0 ? -Math.atan2(o.h * .85, o.w) * g.outward[0] : 0;
		const rotation = g.outward[2] !== 0 ? rot : [
			0,
			rx,
			0
		];
		const bp = g.at(o.s, studInset - .02);
		reg.add({
			id: `${A}.temp-brace.${o.id}`,
			type: "temporary-brace",
			label: `${o.id} temporary opening brace`,
			parentId: A,
			geometry: {
				kind: "box",
				center: [
					bp.x,
					braceY,
					bp.z
				],
				size: g.lumber(braceLen, t, t),
				rotation
			},
			material: MAT.brace,
			assembly: {
				stage: 9,
				dependencies: [kingLId, kingRId],
				explodeGroup: A,
				explodeVector: g.whole,
				localExplodeVector: [
					g.outward[0] * .7,
					0,
					g.outward[2] * .7
				]
			},
			structural: {
				loadPathRole: "temporary",
				required: false
			},
			learning: learn("A temporary brace across the rough opening. It is not a permanent structural member.", "Hold the opening square until the window is set. Safe to remove in this lesson."),
			provenance: PROV_EDU,
			tags: [
				"wall",
				key,
				"temporary",
				"challenge-window"
			]
		});
	}
}
function addSheathing(reg, key, g, A, openings, sheathInset) {
	const h = Y.wallTop - Y.floorTop;
	const y = (Y.floorTop + Y.wallTop) / 2;
	const edges = [
		-g.length / 2,
		...openings.flatMap((o) => [o.s - o.w / 2, o.s + o.w / 2]),
		g.length / 2
	].sort((a, b) => a - b);
	let n = 0;
	for (let i = 0; i < edges.length - 1; i++) {
		const a = edges[i];
		const b = edges[i + 1];
		const w = b - a;
		if (w < .05) continue;
		const mid = (a + b) / 2;
		const opening = openings.find((o) => mid > o.s - o.w / 2 + .01 && mid < o.s + o.w / 2 - .01);
		const p = g.at(mid, sheathInset);
		if (!opening) {
			addPanel(reg, key, g, A, n++, p, y, w, h);
			continue;
		}
		if (opening.sill > .15) {
			const hh = opening.sill;
			const cy = Y.floorTop + hh / 2;
			addPanel(reg, key, g, A, n++, p, cy, w, hh);
		}
		const topH = Y.wallTop - (Y.floorTop + opening.sill + opening.h);
		if (topH > .12) {
			const cy = Y.wallTop - topH / 2;
			addPanel(reg, key, g, A, n++, p, cy, w, topH);
		}
	}
}
function addPanel(reg, key, g, A, n, p, y, along, h) {
	const local = [
		g.outward[0] * .85,
		.05,
		g.outward[2] * .85
	];
	reg.add({
		id: `${A}.sheathing.${n}`,
		type: "wall-sheathing",
		label: `${cap(key)} wall sheathing ${n + 1}`,
		parentId: A,
		geometry: {
			kind: "box",
			center: [
				p.x,
				y,
				p.z
			],
			size: g.lumber(along - .004, h, P.sheathing)
		},
		material: MAT.osb,
		assembly: {
			stage: 10,
			dependencies: [`${A}.stud.00`, `${A}.plate.bottom`],
			explodeGroup: A,
			explodeVector: [
				g.whole[0] + g.outward[0] * .4,
				g.whole[1],
				g.whole[2] + g.outward[2] * .4
			],
			localExplodeVector: local
		},
		structural: { loadPathRole: "wall-sheathing" },
		learning: learn("Wood panels on the outside of the studs.", "Brace the wall in shear and give a surface for later cladding (cladding is not in v0.1)."),
		provenance: PROV_MODEL,
		tags: [
			"wall",
			key,
			"sheathing"
		]
	});
}
function cap(s) {
	return s.slice(0, 1).toUpperCase() + s.slice(1);
}
var cached = null;
function buildPeiHouse() {
	if (cached) return cached;
	const reg = createRegistry();
	addFoundation(reg);
	addFloor(reg);
	addWalls(reg);
	addRoof(reg);
	const assemblies = Object.values(reg.components).filter((c) => c.type === "assembly").map((c) => c.id);
	const graph = {
		id: SPECIMEN_ID,
		version: SPECIMEN_VERSION,
		title: "PEI Part 9 demonstration house",
		jurisdictionId: "ca-pei",
		projectDate: PROJECT_DATE,
		components: reg.components,
		rootIds: assemblies,
		assemblies
	};
	cached = Object.freeze(graph);
	return cached;
}
function clampAmount(amount) {
	if (!Number.isFinite(amount)) return 0;
	return Math.max(0, Math.min(1, amount));
}
function scaleVec(v, s) {
	return [
		v[0] * s,
		v[1] * s,
		v[2] * s
	];
}
function addVec(a, b) {
	return [
		a[0] + b[0],
		a[1] + b[1],
		a[2] + b[2]
	];
}
/**
* Exploded visual offset. Canonical geometry is never mutated.
* amount 0 is always the identity. Repeated 0↔1 cycles cannot drift
* because this is a pure function of (component, amount, scope).
*/
function explodeOffset(graph, component, amount, scope) {
	const a = clampAmount(amount);
	if (a === 0) return [
		0,
		0,
		0
	];
	if (component.geometry.kind === "group") return [
		0,
		0,
		0
	];
	if (scope === "whole") return scaleVec(component.assembly.explodeVector, a);
	if (!belongsToAssembly(graph, component.id, scope)) return [
		0,
		0,
		0
	];
	return scaleVec(component.assembly.localExplodeVector, a);
}
function explodedCenter(graph, component, amount, scope) {
	return addVec(component.geometry.center, explodeOffset(graph, component, amount, scope));
}
var CONSTRUCTION_STAGES = [
	{
		id: 1,
		key: "site",
		label: "Site",
		short: "Site"
	},
	{
		id: 2,
		key: "excavation",
		label: "Excavation",
		short: "Excavate"
	},
	{
		id: 3,
		key: "footing",
		label: "Footings",
		short: "Footing"
	},
	{
		id: 4,
		key: "foundation",
		label: "Foundation",
		short: "Foundation"
	},
	{
		id: 5,
		key: "sill",
		label: "Sill",
		short: "Sill"
	},
	{
		id: 6,
		key: "floor",
		label: "Floor framing",
		short: "Floor"
	},
	{
		id: 7,
		key: "subfloor",
		label: "Subfloor",
		short: "Subfloor"
	},
	{
		id: 8,
		key: "walls",
		label: "Wall plates & studs",
		short: "Walls"
	},
	{
		id: 9,
		key: "openings",
		label: "Opening framing",
		short: "Openings"
	},
	{
		id: 10,
		key: "sheathing",
		label: "Wall sheathing",
		short: "Sheathing"
	},
	{
		id: 11,
		key: "roof-frame",
		label: "Roof framing",
		short: "Roof"
	},
	{
		id: 12,
		key: "roof-deck",
		label: "Roof sheathing",
		short: "Deck"
	},
	{
		id: 13,
		key: "complete",
		label: "Specimen complete",
		short: "Complete"
	}
];
function clampStage(id) {
	return Math.max(1, Math.min(13, Math.round(id)));
}
var DEMO = {
	authority: "EDUCATIONAL_DEMO_RULE",
	sourceIds: ["clove-demo-pack"],
	wording: "executable-logic-only",
	verification: "demo-only"
};
var DEMO_PACK_VERSION = "0.1.0";
var demoRules = [
	{
		id: "DEMO-LOADPATH-001",
		title: "Required support still present",
		packVersion: DEMO_PACK_VERSION,
		provenance: DEMO,
		authorityLabel: "Clove educational demonstration rule — not a representation of an NBC clause",
		evaluate: (ctx, lookup) => {
			const failed = [];
			const all = [
				...lookup.idsByType("header"),
				...lookup.idsByType("jack-stud"),
				...lookup.idsByType("floor-joist"),
				...lookup.idsByType("beam"),
				...lookup.idsByType("column"),
				...lookup.idsByType("sill-plate"),
				...lookup.idsByType("rafter")
			];
			for (const id of all) {
				if (lookup.isRemoved(id)) continue;
				if (!lookup.required(id) && lookup.typeOf(id) !== "header") continue;
				for (const support of lookup.supportedBy(id)) if (lookup.isRemoved(support)) failed.push(id, support);
			}
			const unique = [...new Set(failed)];
			if (unique.length === 0) return {
				verdict: "PASS",
				componentIds: [],
				inputs: { removed: ctx.removedIds.length },
				reason: "Every still-present dependency-critical member has its modelled supports.",
				assumption: "This checks the specimen graph, not structural capacity."
			};
			return {
				verdict: "FAIL",
				componentIds: unique,
				inputs: {
					removed: ctx.removedIds.length,
					broken: unique.length
				},
				reason: "A required support dependency has been intentionally removed, so the modelled load path is incomplete.",
				assumption: "Graph integrity is not a substitute for engineering analysis."
			};
		}
	},
	{
		id: "DEMO-OPENING-001",
		title: "Window / door opening assembly complete",
		packVersion: DEMO_PACK_VERSION,
		provenance: DEMO,
		authorityLabel: "Clove educational demonstration rule — not a permit determination",
		evaluate: (_ctx, lookup) => {
			const headers = lookup.idsByType("header");
			const missing = [];
			const affected = [];
			for (const h of headers) {
				const still = !lookup.isRemoved(h);
				const supports = lookup.supportedBy(h);
				const jacksGone = supports.filter((id) => lookup.isRemoved(id));
				if (!still || jacksGone.length) {
					missing.push(h, ...jacksGone);
					affected.push(h, ...supports);
				}
			}
			if ([...new Set(affected)].length === 0 || missing.length === 0) return {
				verdict: "PASS",
				componentIds: [],
				inputs: { headers: headers.length },
				reason: "Each modelled header still exists and still bears on its jack studs."
			};
			return {
				verdict: "FAIL",
				componentIds: [...new Set(missing)],
				inputs: { headers: headers.length },
				reason: "Opening assembly dependency incomplete — a header and/or its jack studs were removed.",
				assumption: "The lesson is topological: the header is modelled as sitting on the jacks."
			};
		}
	},
	{
		id: "DEMO-SILL-001",
		title: "Sill remains on the foundation path",
		packVersion: DEMO_PACK_VERSION,
		provenance: DEMO,
		authorityLabel: "Clove educational demonstration rule",
		evaluate: (_ctx, lookup) => {
			const sills = lookup.idsByType("sill-plate");
			const gone = sills.filter((id) => lookup.isRemoved(id));
			if (gone.length === 0) return {
				verdict: "PASS",
				componentIds: [],
				inputs: { sills: sills.length },
				reason: "All modelled sill plates remain. Floor members still have a wood-to-concrete transition in the graph."
			};
			return {
				verdict: "FAIL",
				componentIds: gone,
				inputs: {
					sills: sills.length,
					removed: gone.length
				},
				reason: "A sill plate was removed. In this specimen the sill is the required transition from foundation to floor framing."
			};
		}
	},
	{
		id: "NBC-SNOW-001",
		title: "Roof snow load / rafter capacity",
		packVersion: DEMO_PACK_VERSION,
		provenance: {
			authority: "UNKNOWN",
			sourceIds: ["nrc-nbc-2020"],
			wording: "none",
			verification: "unverified"
		},
		authorityLabel: "Not evaluated — climatic data and licensed span tables are absent",
		evaluate: () => ({
			verdict: "MISSING_INFORMATION",
			componentIds: [],
			inputs: {
				snowLoadKPa: null,
				rafterGrade: null,
				spanTables: null
			},
			reason: "This specimen does not contain PEI climatic snow load, lumber grade, or licensed NBC span tables. Rafter size cannot be determined here.",
			assumption: "Absence of data is reported as MISSING INFORMATION rather than a guessed PASS/FAIL.",
			sourceRefs: ["nrc-nbc-2020"]
		})
	},
	{
		id: "LUMBER-GRADE-001",
		title: "Sill plate species and grade",
		packVersion: DEMO_PACK_VERSION,
		provenance: {
			authority: "INFERENCE",
			sourceIds: [],
			wording: "none",
			verification: "unverified"
		},
		authorityLabel: "Uncertain — specimen does not specify grade",
		evaluate: (_ctx, lookup) => {
			return {
				verdict: "UNCERTAIN",
				componentIds: lookup.idsByType("sill-plate"),
				inputs: {
					species: null,
					grade: null,
					treatment: "labelled treated, specification unknown"
				},
				reason: "Sill plates are modelled as preservative-treated lumber, but species, grade, and treatment specification are not in the graph. Whether they satisfy an applicable provision cannot be decided.",
				assumption: "Visual colour is not evidence of compliance."
			};
		}
	},
	{
		id: "PEI-NBC2025-001",
		title: "Whether NBC 2025 applies in PEI on the project date",
		packVersion: DEMO_PACK_VERSION,
		provenance: {
			authority: "OFFICIAL_REGULATION",
			sourceIds: [
				"cbhcc-pt-adoption",
				"nrc-publications",
				"pei-news-2024-03-08"
			],
			wording: "paraphrased",
			verification: "provisional"
		},
		authorityLabel: "Jurisdiction fact — adoption of NBC 2025 in PEI is not verified",
		evaluate: (ctx) => ({
			verdict: "UNCERTAIN",
			componentIds: [],
			inputs: {
				projectDate: ctx.projectDate,
				verifiedPeiNbc2020From: "2024-03-31",
				nrcListsNbc2025: true,
				peiNbc2025Instrument: null
			},
			reason: "PEI’s verified adoption instrument in this pack is NBC 2020 (enforced 31 March 2024). NRC publishes NBC 2025, but no PEI 2025 adoption instrument was verified on retrieval. The applicable edition on the project date is therefore uncertain.",
			assumption: "This application will not infer that a newer national edition is in force locally.",
			sourceRefs: ["cbhcc-pt-adoption", "nrc-publications"]
		})
	}
];
function makeLookup(graph, removedIds) {
	const removed = new Set(removedIds);
	const byType = /* @__PURE__ */ new Map();
	const byTag = /* @__PURE__ */ new Map();
	for (const c of Object.values(graph.components)) {
		const t = byType.get(c.type) ?? [];
		t.push(c.id);
		byType.set(c.type, t);
		for (const tag of c.tags ?? []) {
			const arr = byTag.get(tag) ?? [];
			arr.push(c.id);
			byTag.set(tag, arr);
		}
	}
	return {
		has: (id) => Boolean(graph.components[id]),
		isRemoved: (id) => removed.has(id),
		typeOf: (id) => graph.components[id]?.type,
		idsByType: (type) => byType.get(type) ?? [],
		idsByTag: (tag) => byTag.get(tag) ?? [],
		supportedBy: (id) => graph.components[id]?.structural?.supportedBy ?? [],
		required: (id) => Boolean(graph.components[id]?.structural?.required),
		label: (id) => graph.components[id]?.label ?? id
	};
}
function evaluateRules(graph, ctx, rules = demoRules) {
	const full = {
		...ctx,
		graphId: graph.id,
		graphVersion: graph.version
	};
	const lookup = makeLookup(graph, ctx.removedIds);
	return rules.map((rule) => {
		const result = rule.evaluate(full, lookup);
		return {
			ruleId: rule.id,
			title: rule.title,
			verdict: result.verdict,
			componentIds: result.componentIds,
			inputs: result.inputs,
			reason: result.reason,
			assumption: result.assumption,
			sourceRefs: result.sourceRefs ?? rule.provenance.sourceIds,
			jurisdiction: ctx.jurisdictionId,
			rulePackVersion: rule.packVersion,
			evaluatedAt: ctx.now,
			provenance: rule.provenance,
			authorityLabel: rule.authorityLabel
		};
	});
}
function summarize(results) {
	const counts = {
		PASS: 0,
		FAIL: 0,
		MISSING_INFORMATION: 0,
		UNCERTAIN: 0
	};
	for (const r of results) counts[r.verdict] += 1;
	return counts;
}
function highlightedIds(results) {
	const ids = /* @__PURE__ */ new Set();
	for (const r of results) if (r.verdict === "FAIL" || r.verdict === "UNCERTAIN") for (const id of r.componentIds) ids.add(id);
	return [...ids];
}
var WINDOW_CHALLENGE = {
	id: "challenge.window-opening",
	title: "The window opening",
	prompt: "Several members surround this window. Remove the pieces you believe are unnecessary, then inspect the result and run CHECK.",
	targetAssembly: "assembly.wall.front",
	focusId: "assembly.wall.front.header.W1",
	hintAfterCheck: "The temporary brace is construction scaffolding. The jacks and header are the opening’s load path.",
	removableHintIds: ["assembly.wall.front.temp-brace.W1"],
	criticalIds: [
		"assembly.wall.front.header.W1",
		"assembly.wall.front.jack.W1.L",
		"assembly.wall.front.jack.W1.R",
		"assembly.wall.front.king.W1.L",
		"assembly.wall.front.king.W1.R"
	]
};
function createSnapshot(graph) {
	return {
		graph,
		selectedId: null,
		explodeAmount: 0,
		explodeScope: "whole",
		constructionStage: 13,
		playing: false,
		removedIds: [],
		hiddenIds: [],
		isolatedIds: null,
		mode: "inspect",
		xray: false,
		sectionEnabled: false,
		sectionOffset: 0,
		check: null,
		checkHighlights: [],
		challengeActive: false,
		showDiag: false,
		showReceipt: false,
		showRyanTest: false,
		events: [],
		seq: 0,
		cameraNonce: 0,
		cameraCommand: null
	};
}
function applyCommand(state, command, now = Date.now()) {
	const event = {
		...command,
		at: now,
		seq: state.seq + 1
	};
	const events = [...state.events, event].slice(-240);
	const base = {
		...state,
		events,
		seq: event.seq,
		cameraCommand: null
	};
	switch (command.type) {
		case "SELECT_COMPONENT": return {
			...base,
			selectedId: command.id
		};
		case "SET_EXPLODE": return {
			...base,
			explodeAmount: clampAmount(command.amount)
		};
		case "SET_EXPLODE_SCOPE": return {
			...base,
			explodeScope: command.scope
		};
		case "SET_CONSTRUCTION_STAGE": return {
			...base,
			constructionStage: clampStage(command.stage)
		};
		case "PLAY_SEQUENCE": return {
			...base,
			playing: command.playing
		};
		case "REMOVE_COMPONENT":
			if (state.mode !== "break-it") return state;
			if (!state.graph.components[command.id]) return state;
			if (state.graph.components[command.id].geometry.kind === "group") return state;
			if (state.removedIds.includes(command.id)) return state;
			return {
				...base,
				removedIds: [...state.removedIds, command.id],
				selectedId: state.selectedId === command.id ? command.id : state.selectedId,
				check: null,
				checkHighlights: []
			};
		case "RESTORE_COMPONENT": return {
			...base,
			removedIds: state.removedIds.filter((id) => id !== command.id),
			check: null,
			checkHighlights: []
		};
		case "RESTORE_ALL": return {
			...base,
			removedIds: [],
			check: null,
			checkHighlights: []
		};
		case "HIDE_COMPONENT":
			if (state.hiddenIds.includes(command.id)) return state;
			return {
				...base,
				hiddenIds: [...state.hiddenIds, command.id]
			};
		case "SHOW_COMPONENT": return {
			...base,
			hiddenIds: state.hiddenIds.filter((id) => id !== command.id)
		};
		case "ISOLATE": return {
			...base,
			isolatedIds: command.ids
		};
		case "SET_MODE": return {
			...base,
			mode: command.mode
		};
		case "SET_XRAY": return {
			...base,
			xray: command.enabled
		};
		case "SET_SECTION": return {
			...base,
			sectionEnabled: command.enabled,
			sectionOffset: command.offset ?? state.sectionOffset
		};
		case "RUN_CHECK": {
			const results = evaluateRules(state.graph, {
				jurisdictionId: state.graph.jurisdictionId,
				projectDate: state.graph.projectDate,
				removedIds: state.removedIds,
				hiddenIds: state.hiddenIds,
				now: new Date(now).toISOString()
			});
			return {
				...base,
				check: results,
				checkHighlights: highlightedIds(results)
			};
		}
		case "CLEAR_CHECK": return {
			...base,
			check: null,
			checkHighlights: []
		};
		case "RESET_SPECIMEN": return {
			...createSnapshot(state.graph),
			seq: event.seq,
			events: [...events, {
				type: "RESET_SPECIMEN",
				at: now,
				seq: event.seq
			}],
			cameraNonce: state.cameraNonce + 1,
			cameraCommand: "reset"
		};
		case "RESET_CAMERA": return {
			...base,
			cameraNonce: state.cameraNonce + 1,
			cameraCommand: "reset"
		};
		case "FIT_HOUSE": return {
			...base,
			cameraNonce: state.cameraNonce + 1,
			cameraCommand: "fit-house"
		};
		case "FIT_SELECTED": return {
			...base,
			cameraNonce: state.cameraNonce + 1,
			cameraCommand: "fit-selected"
		};
		case "SET_CHALLENGE": return {
			...base,
			challengeActive: command.active,
			mode: command.active ? "break-it" : state.mode,
			selectedId: command.active ? WINDOW_CHALLENGE.focusId : state.selectedId,
			explodeScope: command.active ? WINDOW_CHALLENGE.targetAssembly : state.explodeScope,
			xray: command.active ? true : state.xray
		};
		case "TOGGLE_DIAG": return {
			...base,
			showDiag: !state.showDiag
		};
		case "TOGGLE_RECEIPT": return {
			...base,
			showReceipt: !state.showReceipt,
			showRyanTest: false
		};
		case "TOGGLE_RYAN_TEST": return {
			...base,
			showRyanTest: !state.showRyanTest,
			showReceipt: false
		};
		default: return state;
	}
}
var baseline = buildPeiHouse();
var useLab = create((set, get) => ({
	...createSnapshot(baseline),
	dispatch: (command) => {
		set((state) => applyCommand(state, command));
	},
	explodeSelection: () => {
		const s = get();
		if (s.explodeAmount > .04) {
			s.dispatch({
				type: "SET_EXPLODE",
				amount: 0
			});
			return;
		}
		let scope = "whole";
		if (s.selectedId) scope = s.graph.components[s.selectedId]?.assembly.explodeGroup ?? "whole";
		s.dispatch({
			type: "SET_EXPLODE_SCOPE",
			scope
		});
		s.dispatch({
			type: "SET_EXPLODE",
			amount: 1
		});
	},
	isolateSelected: () => {
		const s = get();
		if (!s.selectedId) {
			s.dispatch({
				type: "ISOLATE",
				ids: null
			});
			return;
		}
		if (s.isolatedIds) {
			s.dispatch({
				type: "ISOLATE",
				ids: null
			});
			return;
		}
		const assembly = s.graph.components[s.selectedId]?.assembly.explodeGroup ?? s.selectedId;
		const ids = [assembly, ...descendants(s.graph, assembly)];
		s.dispatch({
			type: "ISOLATE",
			ids
		});
	}
}));
/** Deterministic FNV-1a over stable component fields. */
function hashGraph(graph) {
	const ids = Object.keys(graph.components).sort();
	let h = 2166136261;
	mix(graph.id);
	mix(graph.version);
	for (const id of ids) {
		const c = graph.components[id];
		mix(id);
		mix(c.type);
		mix(c.geometry.kind);
		mix(c.geometry.center.map(q).join(","));
		mix(c.geometry.size.map(q).join(","));
		mix(String(c.assembly.stage));
		mix(c.assembly.explodeGroup);
	}
	return (h >>> 0).toString(16).padStart(8, "0");
	function mix(s) {
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
	}
}
function q(n) {
	return n.toFixed(5);
}
var last_run_default = {
	passed: 22,
	failed: 0,
	ranAt: "2026-09-10T09:27:54.298Z",
	browserVerification: "NOT VERIFIED",
	ruleDeterminism: "PASS"
};
function liveReceipt(graph, snapshot) {
	const issues = checkGraphIntegrity(graph);
	const sample = Object.values(graph.components).find((c) => c.geometry.kind === "box");
	const z = explodeOffset(graph, sample, 0, "whole");
	const a = explodeOffset(graph, sample, 1, "whole");
	const b = explodeOffset(graph, sample, 0, "whole");
	const c = explodeOffset(graph, sample, 1, "whole");
	const explodeOk = z.every((n) => n === 0) && b.every((n) => n === 0) && a[0] === c[0] && a[1] === c[1] && a[2] === c[2];
	const seqOk = Object.values(graph.components).every((comp) => comp.assembly.stage >= 1 && comp.assembly.stage <= 13);
	const resetOk = snapshot.removedIds.length === 0 && snapshot.explodeAmount === 0;
	return {
		specimen: graph.id,
		version: graph.version,
		graphIntegrity: issues.length === 0 ? "PASS" : "FAIL",
		explodeInvariant: explodeOk ? "PASS" : "FAIL",
		sequenceInvariant: seqOk ? "PASS" : "FAIL",
		resetInvariant: resetOk ? "PASS" : "FAIL",
		ruleDeterminism: last_run_default.ruleDeterminism === "PASS" ? "PASS" : "FAIL",
		automated: {
			passed: last_run_default.passed,
			failed: last_run_default.failed,
			ranAt: last_run_default.ranAt
		},
		browserVerification: last_run_default.browserVerification,
		regulatoryPack: "PROTOTYPE / PARTIALLY VERIFIED",
		knownLimitations: [
			"No finite-element structural analysis.",
			"NBC provision text is not reproduced; most construction rules are educational demo rules.",
			"PEI adoption of NBC 2025 is unverified as of 2026-09-10.",
			"Break It mutations reset on reload; Ryan Test marks persist locally.",
			"Desktop is the acceptance target; mobile is usable but not the design center."
		],
		graphHash: hashGraph(graph),
		componentCount: Object.keys(graph.components).length
	};
}
function BuildReceipt() {
	const open = useLab((s) => s.showReceipt);
	const snapshot = useLab((s) => s);
	const dispatch = useLab((s) => s.dispatch);
	if (!open) return null;
	const r = liveReceipt(snapshot.graph, snapshot);
	const rows = [
		["Specimen", r.specimen],
		["Version", r.version],
		["Graph hash", r.graphHash],
		["Components", String(r.componentCount)],
		["Graph integrity", r.graphIntegrity],
		["Explode invariant", r.explodeInvariant],
		["Sequence invariant", r.sequenceInvariant],
		["Reset invariant", r.resetInvariant],
		["Rule determinism", r.ruleDeterminism],
		["Automated tests", `${r.automated.passed} passed / ${r.automated.failed} failed (${r.automated.ranAt})`],
		["Browser verification", r.browserVerification],
		["Regulatory pack", r.regulatoryPack]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "lab-drawer",
		"aria-label": "Build Receipt",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "lab-check-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lab-kicker",
					children: "Build Receipt"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Clove Build Lab" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "lab-btn",
					onClick: () => dispatch({ type: "TOGGLE_RECEIPT" }),
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "lab-dl",
				children: rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "lab-mono",
					children: v
				})] }, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-kicker",
				children: "Known limitations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "lab-plain",
				children: r.knownLimitations.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: l }, l))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-disclaimer",
				children: "This drawer does not certify itself. Automated counts come from the last executed test run written to last-run.json."
			})
		]
	});
}
function ChallengeBanner() {
	const active = useLab((s) => s.challengeActive);
	const check = useLab((s) => s.check);
	const dispatch = useLab((s) => s.dispatch);
	if (!active) return null;
	const opening = check?.find((r) => r.ruleId === "DEMO-OPENING-001");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lab-challenge",
		role: "region",
		"aria-label": "Break It challenge",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-kicker",
				children: "Break It"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: WINDOW_CHALLENGE.title }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: WINDOW_CHALLENGE.prompt }),
			opening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-note",
				children: opening.verdict === "FAIL" ? opening.reason : WINDOW_CHALLENGE.hintAfterCheck
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lab-inspect-actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn lab-btn-accent",
						onClick: () => dispatch({ type: "RUN_CHECK" }),
						children: "Check my build"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => dispatch({ type: "RESTORE_ALL" }),
						children: "Try again"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => dispatch({
							type: "SET_CHALLENGE",
							active: false
						}),
						children: "Dismiss"
					})
				]
			})
		]
	});
}
function CheckDrawer() {
	const check = useLab((s) => s.check);
	const dispatch = useLab((s) => s.dispatch);
	const graph = useLab((s) => s.graph);
	if (!check) return null;
	const counts = summarize(check);
	const issues = check.filter((r) => r.verdict !== "PASS");
	const headline = counts.FAIL > 0 ? "FAIL" : counts.MISSING_INFORMATION > 0 || counts.UNCERTAIN > 0 ? "INCOMPLETE" : "PASS";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "lab-check",
		"aria-label": "Build check",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "lab-check-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lab-kicker",
					children: "Build check"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: `lab-check-verdict lab-check-${headline.toLowerCase()}`,
					children: headline
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "lab-btn",
					onClick: () => dispatch({ type: "CLEAR_CHECK" }),
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "lab-muted",
				children: [
					counts.FAIL,
					" fail · ",
					counts.MISSING_INFORMATION,
					" missing information · ",
					counts.UNCERTAIN,
					" uncertain · ",
					counts.PASS,
					" pass"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-disclaimer",
				children: "Not a permit determination."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "lab-check-list",
				children: issues.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "lab-check-item",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lab-check-item-head",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `lab-pill lab-pill-${r.verdict.toLowerCase().replace("_", "-")}`,
								children: r.verdict.replaceAll("_", " ")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: r.title })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.reason }),
						r.assumption ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lab-muted",
							children: r.assumption
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lab-prov",
							children: r.authorityLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "lab-mono",
							children: [
								r.ruleId,
								" · pack ",
								r.rulePackVersion,
								" · ",
								r.provenance.authority
							]
						}),
						r.componentIds.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "lab-muted",
							children: ["Affected: ", r.componentIds.map((id) => graph.components[id]?.label ?? id).join(", ")]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "lab-inspect-actions",
							children: r.componentIds[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "lab-btn",
								onClick: () => {
									dispatch({
										type: "SELECT_COMPONENT",
										id: r.componentIds[0]
									});
									dispatch({ type: "FIT_SELECTED" });
								},
								children: "Show in 3D"
							}) : null
						})
					]
				}, r.ruleId))
			})
		]
	});
}
function DiagPanel() {
	const open = useLab((s) => s.showDiag);
	const graph = useLab((s) => s.graph);
	const explodeAmount = useLab((s) => s.explodeAmount);
	const stage = useLab((s) => s.constructionStage);
	const removed = useLab((s) => s.removedIds.length);
	const [perf, setPerf] = (0, import_react.useState)({
		fps: 0,
		drawCalls: 0
	});
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const id = window.setInterval(() => {
			const clove = window.__clove;
			if (clove) setPerf({
				fps: clove.fps,
				drawCalls: clove.drawCalls
			});
		}, 400);
		return () => window.clearInterval(id);
	}, [open]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lab-diag",
		"aria-label": "Diagnostics",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "lab-mono",
			children: [
				"fps ",
				perf.fps.toFixed(0),
				" · calls ",
				perf.drawCalls,
				" · explode ",
				explodeAmount.toFixed(2),
				" · stage ",
				stage,
				" · removed ",
				removed
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "lab-mono",
			children: ["hash ", hashGraph(graph)]
		})]
	});
}
function Hint() {
	const [show, setShow] = (0, import_react.useState)(true);
	const selectedId = useLab((s) => s.selectedId);
	const explodeAmount = useLab((s) => s.explodeAmount);
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => setShow(false), 9e3);
		return () => window.clearTimeout(t);
	}, []);
	(0, import_react.useEffect)(() => {
		if (selectedId || explodeAmount > .02) setShow(false);
	}, [selectedId, explodeAmount]);
	if (!show) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "lab-hint",
		role: "note",
		children: "Drag to orbit · Scroll to zoom · Click any part"
	});
}
/** Format SI metres as metric + familiar imperial for display. */
function formatMetres(m) {
	const abs = Math.abs(m);
	let metric;
	if (abs >= 1) metric = `${trimNum(m, 3)} m`;
	else metric = `${Math.round(m * 1e3)} mm`;
	const totalIn = m / .0254;
	const sign = totalIn < 0 ? "-" : "";
	const inchesAbs = Math.abs(totalIn);
	const feet = Math.floor(inchesAbs / 12 + 1e-9);
	const inches = inchesAbs - feet * 12;
	const inchesRounded = Math.round(inches * 10) / 10;
	let imperial;
	if (feet === 0) imperial = `${sign}${inchesRounded}″`;
	else if (Math.abs(inchesRounded) < .05) imperial = `${sign}${feet}′-0″`;
	else imperial = `${sign}${feet}′-${inchesRounded}″`;
	return {
		metric,
		imperial,
		both: `${metric} (${imperial})`
	};
}
function formatSize(size) {
	return size.map((v) => formatMetres(v).both).join(" × ");
}
function trimNum(n, max = 3) {
	return n.toFixed(max).replace(/\.?0+$/, "");
}
function parentLabel(graph, c) {
	if (!c.parentId) return "—";
	return graph.components[c.parentId]?.label ?? c.parentId;
}
function stageName(stage) {
	return CONSTRUCTION_STAGES.find((s) => s.id === stage)?.label ?? `Stage ${stage}`;
}
function dimLines(c) {
	const [x, y, z] = c.geometry.size;
	return {
		metric: [
			x,
			y,
			z
		].map((v) => formatMetres(v).metric).join(" × "),
		imperial: [
			x,
			y,
			z
		].map((v) => formatMetres(v).imperial).join(" × "),
		both: formatSize(c.geometry.size)
	};
}
function authorityLabel(c) {
	switch (c.provenance.authority) {
		case "OFFICIAL_REGULATION": return "Official regulation";
		case "OFFICIAL_GUIDANCE": return "Official guidance";
		case "STANDARD_REFERENCE": return "Standard reference";
		case "VERIFIED_ENGINEERING_RELATION": return "Verified engineering relation";
		case "PROJECT_MODEL_ASSUMPTION": return "Project model assumption";
		case "EDUCATIONAL_DEMO_RULE": return "Educational demonstration";
		case "INFERENCE": return "Inference";
		default: return "Unknown";
	}
}
function Inspector() {
	const graph = useLab((s) => s.graph);
	const selectedId = useLab((s) => s.selectedId);
	const mode = useLab((s) => s.mode);
	const removedIds = useLab((s) => s.removedIds);
	const dispatch = useLab((s) => s.dispatch);
	const explodeSelection = useLab((s) => s.explodeSelection);
	const isolateSelected = useLab((s) => s.isolateSelected);
	const isolatedIds = useLab((s) => s.isolatedIds);
	if (!selectedId) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "lab-inspector",
		"aria-label": "Inspector",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "lab-kicker",
			children: "Inspect"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "lab-muted",
			children: "Click a member in the house. The graph, not the mesh name, is the source of truth."
		})]
	});
	const c = graph.components[selectedId];
	if (!c) return null;
	const dims = dimLines(c);
	const removed = removedIds.includes(c.id);
	const supports = (c.structural?.supports ?? []).map((id) => graph.components[id]?.label ?? id);
	const supportedBy = (c.structural?.supportedBy ?? []).map((id) => graph.components[id]?.label ?? id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "lab-inspector",
		"aria-label": "Inspector",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-kicker",
				children: c.type.replace(/-/g, " ")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "lab-inspect-title",
				children: c.label
			}),
			removed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-pill lab-pill-fail",
				children: "Removed"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "lab-dl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Dimensions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: dims.both })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Material" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: c.material.label })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Phase" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
						c.assembly.stage,
						" · ",
						stageName(c.assembly.stage)
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Assembly" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: parentLabel(graph, c) })] }),
					c.structural?.loadPathRole ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Load path" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: c.structural.loadPathRole.replace(/-/g, " ") })] }) : null,
					supportedBy.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Supported by" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: supportedBy.join(", ") })] }) : null,
					supports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Supports" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: supports.join(", ") })] }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-purpose",
				children: c.learning.purpose
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lab-note",
				children: c.learning.shortDescription
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "lab-prov",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: authorityLabel(c) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "lab-muted",
					children: [" · ", c.provenance.status]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lab-inspect-actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => isolateSelected(),
						children: isolatedIds ? "Show context" : "Isolate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => dispatch({
							type: "HIDE_COMPONENT",
							id: c.id
						}),
						children: "Hide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => explodeSelection(),
						children: "Explode assembly"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => dispatch({ type: "FIT_SELECTED" }),
						children: "Fit camera"
					}),
					mode === "break-it" && c.geometry.kind === "box" ? removed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn lab-btn-accent",
						onClick: () => dispatch({
							type: "RESTORE_COMPONENT",
							id: c.id
						}),
						children: "Restore"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn lab-btn-accent",
						onClick: () => dispatch({
							type: "REMOVE_COMPONENT",
							id: c.id
						}),
						children: "Remove"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => {
							dispatch({
								type: "ISOLATE",
								ids: null
							});
							dispatch({
								type: "SHOW_COMPONENT",
								id: c.id
							});
							const kids = descendants(graph, c.assembly.explodeGroup);
							for (const id of kids) dispatch({
								type: "SHOW_COMPONENT",
								id
							});
						},
						children: "Reset view"
					})
				]
			})
		]
	});
}
var TESTS = [
	{
		id: "A",
		title: "Orbit",
		body: "Orbit completely around the house."
	},
	{
		id: "B",
		title: "Whole explode",
		body: "Explode the complete building to 100%, then return to 0%."
	},
	{
		id: "C",
		title: "Local explode",
		body: "Select an exterior wall and explode only that assembly."
	},
	{
		id: "D",
		title: "Construction scrub",
		body: "Scrub construction from bare site to completed framing and backward."
	},
	{
		id: "E",
		title: "Inspect",
		body: "Inspect a normal stud, header, floor member and foundation element."
	},
	{
		id: "F",
		title: "Break It",
		body: "Enter Break It and remove a designated component around the window opening."
	},
	{
		id: "G",
		title: "Check locates",
		body: "Run CHECK and verify the issue is visibly located in 3D."
	},
	{
		id: "H",
		title: "Restore",
		body: "Restore the component and verify the result changes."
	},
	{
		id: "I",
		title: "No bluff",
		body: "Create a case the prototype cannot determine and confirm it says MISSING or UNCERTAIN rather than bluffing."
	},
	{
		id: "J",
		title: "Reset",
		body: "Press RESET and confirm the entire house returns to canonical state."
	}
];
var KEY = "clove.ryan-test.v1";
function RyanTest() {
	const open = useLab((s) => s.showRyanTest);
	const dispatch = useLab((s) => s.dispatch);
	const [marks, setMarks] = (0, import_react.useState)({});
	const [notes, setNotes] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				setMarks(parsed.marks ?? {});
				setNotes(parsed.notes ?? {});
			}
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		localStorage.setItem(KEY, JSON.stringify({
			marks,
			notes
		}));
	}, [marks, notes]);
	const text = (0, import_react.useMemo)(() => {
		return [
			"CLOVE BUILD LAB — RYAN TEST",
			`Date: ${(/* @__PURE__ */ new Date()).toISOString()}`,
			"",
			...TESTS.map((t) => {
				const mark = marks[t.id] || "UNMARKED";
				const note = notes[t.id] ? ` — ${notes[t.id]}` : "";
				return `TEST ${t.id} (${t.title}): ${mark}${note}`;
			})
		].join("\n");
	}, [marks, notes]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "lab-drawer",
		"aria-label": "Ryan Test",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "lab-check-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lab-kicker",
					children: "Human test card"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Ryan Test" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "lab-btn",
					onClick: () => dispatch({ type: "TOGGLE_RYAN_TEST" }),
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "lab-test-list",
				children: TESTS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["TEST ", t.id] }),
						" ",
						t.title
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lab-muted",
						children: t.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lab-inspect-actions",
						children: [
							"PASS",
							"FAIL",
							"NOTE"
						].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: marks[t.id] === m ? "lab-btn lab-btn-on" : "lab-btn",
							onClick: () => setMarks((prev) => ({
								...prev,
								[t.id]: m
							})),
							children: m
						}, m))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "lab-input",
						placeholder: "Note",
						value: notes[t.id] ?? "",
						onChange: (e) => setNotes((prev) => ({
							...prev,
							[t.id]: e.target.value
						}))
					})
				] }, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "lab-btn lab-btn-accent",
				onClick: async () => {
					try {
						await navigator.clipboard.writeText(text);
					} catch {
						const area = document.createElement("textarea");
						area.value = text;
						document.body.appendChild(area);
						area.select();
						document.execCommand("copy");
						area.remove();
					}
				},
				children: "Copy test results"
			})
		]
	});
}
function Scrubber() {
	const stage = useLab((s) => s.constructionStage);
	const playing = useLab((s) => s.playing);
	const dispatch = useLab((s) => s.dispatch);
	const current = CONSTRUCTION_STAGES.find((s) => s.id === stage);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lab-scrubber",
		"aria-label": "Construction sequence",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "lab-icon-btn",
				"aria-label": "Previous stage",
				onClick: () => {
					dispatch({
						type: "PLAY_SEQUENCE",
						playing: false
					});
					dispatch({
						type: "SET_CONSTRUCTION_STAGE",
						stage: stage - 1
					});
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { size: 14 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "lab-icon-btn",
				"aria-label": playing ? "Pause" : "Play construction",
				onClick: () => dispatch({
					type: "PLAY_SEQUENCE",
					playing: !playing
				}),
				children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 14 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "lab-icon-btn",
				"aria-label": "Next stage",
				onClick: () => {
					dispatch({
						type: "PLAY_SEQUENCE",
						playing: false
					});
					dispatch({
						type: "SET_CONSTRUCTION_STAGE",
						stage: stage + 1
					});
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { size: 14 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "lab-scrubber-label",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lab-kicker",
					children: "Construction"
				}), current?.label]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min: 1,
				max: 13,
				step: 1,
				value: stage,
				"aria-valuetext": current?.label,
				"aria-label": "Construction stage",
				className: "lab-range",
				onChange: (e) => {
					dispatch({
						type: "PLAY_SEQUENCE",
						playing: false
					});
					dispatch({
						type: "SET_CONSTRUCTION_STAGE",
						stage: Number(e.target.value)
					});
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "lab-range-ends",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Foundation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Roof" })]
			})
		]
	});
}
function Toolbar() {
	const mode = useLab((s) => s.mode);
	const explodeAmount = useLab((s) => s.explodeAmount);
	const xray = useLab((s) => s.xray);
	const sectionEnabled = useLab((s) => s.sectionEnabled);
	const sectionOffset = useLab((s) => s.sectionOffset);
	const challengeActive = useLab((s) => s.challengeActive);
	const dispatch = useLab((s) => s.dispatch);
	const explodeSelection = useLab((s) => s.explodeSelection);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lab-toolbar",
		role: "toolbar",
		"aria-label": "Laboratory controls",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "lab-explode",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Explode" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 100,
						value: Math.round(explodeAmount * 100),
						"aria-label": "Explode amount",
						className: "lab-range lab-range-explode",
						onChange: (e) => dispatch({
							type: "SET_EXPLODE",
							amount: Number(e.target.value) / 100
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "lab-tabular",
						children: [Math.round(explodeAmount * 100), "%"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "lab-btn",
				onClick: () => explodeSelection(),
				children: explodeAmount > .04 ? "Collapse" : "Explode"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: mode === "inspect" ? "lab-btn lab-btn-on" : "lab-btn",
				onClick: () => dispatch({
					type: "SET_MODE",
					mode: "inspect"
				}),
				children: "Inspect"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: mode === "break-it" ? "lab-btn lab-btn-on" : "lab-btn",
				onClick: () => dispatch({
					type: "SET_MODE",
					mode: "break-it"
				}),
				children: "Break It"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "lab-btn lab-btn-accent",
				onClick: () => dispatch({ type: "RUN_CHECK" }),
				children: "Check"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "lab-btn",
				onClick: () => dispatch({ type: "RESET_SPECIMEN" }),
				children: "Reset"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: xray ? "lab-btn lab-btn-on" : "lab-btn",
				onClick: () => dispatch({
					type: "SET_XRAY",
					enabled: !xray
				}),
				children: "X-ray"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: sectionEnabled ? "lab-btn lab-btn-on" : "lab-btn",
				onClick: () => dispatch({
					type: "SET_SECTION",
					enabled: !sectionEnabled
				}),
				children: "Section"
			}),
			sectionEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "lab-explode",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Section plane"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: -4,
					max: 4,
					step: .05,
					value: sectionOffset,
					"aria-label": "Section plane offset",
					className: "lab-range lab-range-explode",
					onChange: (e) => dispatch({
						type: "SET_SECTION",
						enabled: true,
						offset: Number(e.target.value)
					})
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: challengeActive ? "lab-btn lab-btn-on" : "lab-btn",
				onClick: () => dispatch({
					type: "SET_CHALLENGE",
					active: !challengeActive
				}),
				children: WINDOW_CHALLENGE.title
			})
		]
	});
}
/** Retrieved 2026-09-10. See research/source-manifest.json. */
var PEI_PACK = {
	id: "ca-pei",
	country: "Canada",
	provinceOrTerritory: "Prince Edward Island",
	effectiveFrom: "2024-03-31",
	adoptedCodeEditions: [{
		family: "NBC",
		edition: "2020",
		energyTier: "Energy Performance Tier 1",
		adopted: "full",
		enforcementDate: "2024-03-31"
	}, {
		family: "NECB",
		edition: "2020",
		energyTier: "Energy Performance Tier 1",
		adopted: "full",
		enforcementDate: "2024-03-31"
	}],
	amendments: [{
		id: "pei-ec177-20-schedules",
		summary: "PEI Building Codes Regulations (EC177/20) adopt NBC 2020 with modifications specified in Schedules A and B. Schedule contents are not encoded as executable rules in v0.1.",
		sourceId: "canlii-ec177-20",
		verification: "provisional"
	}],
	sources: [
		{
			id: "pei-news-2024-03-08",
			organization: "Government of Prince Edward Island",
			title: "New building codes take effect March 31",
			locator: "https://www.princeedwardisland.ca/en/news/new-building-codes-take-effect-march-31",
			retrieved: "2026-09-10",
			kind: "official-news",
			notes: "Announces amendments to Building Codes Act Regulations adopting the 2020 national building and energy codes, effective 31 March 2024. In-progress projects remain under 2015 editions."
		},
		{
			id: "cbhcc-pt-adoption",
			organization: "Canadian Board for Harmonized Construction Codes",
			title: "Provincial/Territorial adoption",
			locator: "https://cbhcc-cchcc.ca/en/provincial-territorial-adoption/",
			retrieved: "2026-09-10",
			kind: "code-development-body",
			notes: "Table (edition in effect as of August 2024): PEI NBC 2020 Energy Performance Tier 1, adopted in full, enforcement 31 March 2024."
		},
		{
			id: "canlii-ec177-20",
			organization: "Prince Edward Island (via CanLII office consolidation)",
			title: "Building Codes Regulations, PEI Reg EC177/20",
			locator: "https://www.canlii.org/en/pe/laws/regu/pei-reg-ec177-20/latest/pei-reg-ec177-20.html",
			retrieved: "2026-09-10",
			kind: "secondary-consolidation",
			notes: "Office consolidation current to 31 March 2024. Section 2(1) adopts NBC 2020 with Schedules A and B; section 2(2) adopts NECB 2020 (EC177/20; 179/24). Not the official Gazette text."
		},
		{
			id: "pei-bca",
			organization: "Government of Prince Edward Island",
			title: "Building Codes Act, R.S.P.E.I. 1988, Cap. B-5.1",
			locator: "https://www.princeedwardisland.ca/sites/default/files/8a92/B-05-1-Building%20Codes%20Act.pdf",
			retrieved: "2026-09-10",
			kind: "official-legislation",
			notes: "Enabling statute. s.32 authorizes adoption of specified NBC/NECB editions by regulation."
		},
		{
			id: "nrc-nbc-2020",
			organization: "National Research Council of Canada",
			title: "National Building Code of Canada 2020",
			locator: "https://nrc.canada.ca/en/certifications-evaluations-standards/codes-canada/codes-canada-publications/national-building-code-canada-2020",
			retrieved: "2026-09-10",
			kind: "official-agency",
			notes: "NBC 2020 is developed under the (then) CCBFC / now CBHCC and published by NRC. Substantial reproduction of code text is not licensed to this project."
		},
		{
			id: "nrc-publications",
			organization: "National Research Council of Canada",
			title: "Codes Canada publications",
			locator: "https://nrc.canada.ca/en/certifications-evaluations-standards/codes-canada/codes-canada-publications",
			retrieved: "2026-09-10",
			kind: "official-agency",
			notes: "NRC lists NBC 2025 among current publications. PEI adoption of the 2025 edition was not verified on 2026-09-10."
		}
	],
	buildingType: "Detached demonstration house (Part 9 orientation)",
	codeFamilyLabel: "NBC 2020 / PEI adoption context",
	regulatoryStatus: "Educational prototype — not a permit determination"
};
function packForDate(dateIso) {
	const date = dateIso.slice(0, 10);
	if (PEI_PACK.effectiveFrom && date < PEI_PACK.effectiveFrom) return {
		...PEI_PACK,
		adoptedCodeEditions: [{
			family: "NBC",
			edition: "2015",
			adopted: "unknown",
			enforcementDate: void 0
		}],
		regulatoryStatus: "Project date is before the verified 31 Mar 2024 NBC 2020 PEI enforcement date. 2015 context is noted from official news about in-progress projects, not fully encoded."
	};
	return PEI_PACK;
}
var PACKS = { "ca-pei": packForDate };
function selectJurisdiction(id, projectDate) {
	const fn = PACKS[id];
	if (!fn) return PEI_PACK;
	return fn(projectDate);
}
function TopBar() {
	const graph = useLab((s) => s.graph);
	const dispatch = useLab((s) => s.dispatch);
	const pack = selectJurisdiction(graph.jurisdictionId, graph.projectDate);
	const nbc = pack.adoptedCodeEditions.find((e) => e.family === "NBC");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "lab-top",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lab-brand",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lab-wordmark",
					children: "Clove"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lab-product",
					children: "Build Lab"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lab-context",
				title: pack.regulatoryStatus,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PEI · Prototype" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "lab-dot",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: nbc ? `NBC ${nbc.edition}` : pack.codeFamilyLabel }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "lab-dot",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: graph.projectDate })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lab-top-actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => dispatch({ type: "FIT_HOUSE" }),
						children: "Fit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => dispatch({ type: "TOGGLE_RYAN_TEST" }),
						children: "Ryan Test"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => dispatch({ type: "TOGGLE_RECEIPT" }),
						children: "Build Receipt"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lab-btn",
						onClick: () => dispatch({ type: "TOGGLE_DIAG" }),
						"aria-label": "Diagnostics",
						children: "Diag"
					})
				]
			})
		]
	});
}
function LabShell() {
	const [Viewport, setViewport] = (0, import_react.useState)(null);
	const playing = useLab((s) => s.playing);
	const stage = useLab((s) => s.constructionStage);
	const dispatch = useLab((s) => s.dispatch);
	const mode = useLab((s) => s.mode);
	const selectedId = useLab((s) => s.selectedId);
	(0, import_react.useEffect)(() => {
		import("./Viewport-DF6SeYIk.mjs").then((m) => setViewport(() => m.Viewport));
	}, []);
	(0, import_react.useEffect)(() => {
		if (!playing) return;
		let acc = 0;
		let last = performance.now();
		let raf = 0;
		const loop = (t) => {
			const dt = Math.min((t - last) / 1e3, .1);
			last = t;
			acc += dt;
			if (acc >= .8) {
				acc = 0;
				const s = useLab.getState();
				if (s.constructionStage >= 13) {
					s.dispatch({
						type: "PLAY_SEQUENCE",
						playing: false
					});
					return;
				}
				s.dispatch({
					type: "SET_CONSTRUCTION_STAGE",
					stage: s.constructionStage + 1
				});
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [playing]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			if (e.key === "Escape") {
				dispatch({
					type: "SELECT_COMPONENT",
					id: null
				});
				dispatch({ type: "CLEAR_CHECK" });
			} else if (e.key === "ArrowRight") {
				dispatch({
					type: "PLAY_SEQUENCE",
					playing: false
				});
				dispatch({
					type: "SET_CONSTRUCTION_STAGE",
					stage: Math.min(13, stage + 1)
				});
			} else if (e.key === "ArrowLeft") {
				dispatch({
					type: "PLAY_SEQUENCE",
					playing: false
				});
				dispatch({
					type: "SET_CONSTRUCTION_STAGE",
					stage: Math.max(1, stage - 1)
				});
			} else if (e.key === "x" || e.key === "X") dispatch({
				type: "SET_XRAY",
				enabled: !useLab.getState().xray
			});
			else if (e.key === "e" || e.key === "E") useLab.getState().explodeSelection();
			else if (e.key === " ") {
				e.preventDefault();
				dispatch({
					type: "PLAY_SEQUENCE",
					playing: !useLab.getState().playing
				});
			} else if ((e.key === "Backspace" || e.key === "Delete") && mode === "break-it" && selectedId) {
				e.preventDefault();
				dispatch({
					type: "REMOVE_COMPONENT",
					id: selectedId
				});
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		dispatch,
		mode,
		selectedId,
		stage
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lab-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lab-main",
				children: [
					Viewport ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lab-stage lab-stage-boot",
						children: "Loading laboratory…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChallengeBanner, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckDrawer, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RyanTest, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildReceipt, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagPanel, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrubber, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, {})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabShell, {});
}
//#endregion
export { belongsToAssembly as i, useLab as n, explodedCenter as r, routes_exports as t };
