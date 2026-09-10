import * as THREE from "three";

function canvasTex(paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, size = 256): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("no 2d");
  paint(ctx, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function wood(base: string, grain: string): THREE.CanvasTexture {
  return canvasTex((ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 48; i++) {
      ctx.strokeStyle = grain;
      ctx.globalAlpha = 0.08 + (i % 7) * 0.015;
      ctx.lineWidth = 1 + (i % 3);
      const y = (i / 48) * h + 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 4, w, y + 1);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#3a2412";
    for (let i = 0; i < 30; i++) ctx.fillRect((i * 37) % w, (i * 53) % h, 2, 8);
    ctx.globalAlpha = 1;
  });
}

function osb(): THREE.CanvasTexture {
  return canvasTex((ctx, w, h) => {
    ctx.fillStyle = "#c6a36a";
    ctx.fillRect(0, 0, w, h);
    const colors = ["#b08a52", "#d4b07a", "#9a7344", "#c4a070"];
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = colors[i % colors.length]!;
      ctx.globalAlpha = 0.45;
      const x = (i * 47) % w;
      const y = (i * 29) % h;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((i * 13) % 180) * (Math.PI / 180));
      ctx.fillRect(-10, -3, 18 + (i % 10), 4 + (i % 3));
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
}

function concrete(): THREE.CanvasTexture {
  return canvasTex((ctx, w, h) => {
    ctx.fillStyle = "#8d8c85";
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = ((i * 13) % 17) - 8;
      img.data[i] = img.data[i]! + n;
      img.data[i + 1] = img.data[i + 1]! + n;
      img.data[i + 2] = img.data[i + 2]! + n;
    }
    ctx.putImageData(img, 0, 0);
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#6e6d66";
    for (let x = 0; x < w; x += 64) ctx.fillRect(x, 0, 1, h);
    for (let y = 0; y < h; y += 64) ctx.fillRect(0, y, w, 1);
    ctx.globalAlpha = 1;
  }, 256);
}

function soil(): THREE.CanvasTexture {
  return canvasTex((ctx, w, h) => {
    ctx.fillStyle = "#5c5144";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = i % 2 ? "#4a4036" : "#6a5d4e";
      ctx.fillRect((i * 41) % w, (i * 23) % h, 3, 3);
    }
    ctx.globalAlpha = 1;
  });
}

export type LabMaterials = {
  wood: THREE.MeshStandardMaterial;
  treated: THREE.MeshStandardMaterial;
  brace: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  osb: THREE.MeshStandardMaterial;
  soil: THREE.MeshStandardMaterial;
  grass: THREE.MeshStandardMaterial;
  selected: THREE.LineBasicMaterial;
  issue: THREE.LineBasicMaterial;
  ghost: THREE.MeshStandardMaterial;
  dispose: () => void;
};

export function createLabMaterials(): LabMaterials {
  const woodMap = wood("#c4a070", "#5a3818");
  const treatedMap = wood("#73825f", "#2f3a24");
  const braceMap = wood("#b57a48", "#5a3010");
  const osbMap = osb();
  const concMap = concrete();
  const soilMap = soil();

  const std = (map: THREE.Texture, color: string, rough: number, extra?: Partial<THREE.MeshStandardMaterialParameters>) =>
    new THREE.MeshStandardMaterial({
      map,
      color,
      roughness: rough,
      metalness: 0.02,
      envMapIntensity: 0.4,
      ...extra,
    });

  const woodMat = std(woodMap, "#d8c09a", 0.72);
  woodMap.repeat.set(1, 2);
  const treated = std(treatedMap, "#c5d0b0", 0.78);
  const brace = std(braceMap, "#e0b089", 0.7);
  const conc = std(concMap, "#cfcfc8", 0.92);
  conc.bumpMap = concMap;
  conc.bumpScale = 0.04;
  const osbMat = std(osbMap, "#e6d0a8", 0.86);
  const soilMat = std(soilMap, "#8a7b68", 0.95);
  const grass = new THREE.MeshStandardMaterial({
    color: "#6e7464",
    roughness: 0.95,
    metalness: 0,
  });
  const ghost = new THREE.MeshStandardMaterial({
    color: "#d9d2c5",
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    roughness: 0.9,
  });

  const all = [woodMat, treated, brace, conc, osbMat, soilMat, grass, ghost];
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
    selected: new THREE.LineBasicMaterial({ color: "#f3ebe1", transparent: true, opacity: 0.95 }),
    issue: new THREE.LineBasicMaterial({ color: "#b55233", transparent: true, opacity: 0.95 }),
    ghost,
    dispose: () => {
      woodMap.dispose();
      treatedMap.dispose();
      braceMap.dispose();
      osbMap.dispose();
      concMap.dispose();
      soilMap.dispose();
      for (const m of all) m.dispose();
    },
  };
}

export function materialFor(family: string, mats: LabMaterials): THREE.MeshStandardMaterial {
  switch (family) {
    case "concrete":
      return mats.concrete;
    case "wood-treated":
      return mats.treated;
    case "sheathing":
      return mats.osb;
    case "soil":
      return mats.soil;
    case "context":
      return mats.grass;
    default:
      return mats.wood;
  }
}
