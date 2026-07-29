import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const outputPath = path.join(
  projectRoot,
  "public",
  "models",
  "chunxiang-avatar.glb",
);

class NodeFileReader {
  result = null;
  error = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((result) => {
        this.result = result;
        this.onloadend?.({ target: this });
      })
      .catch((error) => {
        this.error = error;
        this.onerror?.(error);
      });
  }

  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((result) => {
        const mime = blob.type || "application/octet-stream";
        this.result = `data:${mime};base64,${Buffer.from(result).toString("base64")}`;
        this.onloadend?.({ target: this });
      })
      .catch((error) => {
        this.error = error;
        this.onerror?.(error);
      });
  }
}

globalThis.FileReader ??= NodeFileReader;

const palette = {
  skin: "#d6a17f",
  skinWarm: "#bd7d60",
  hair: "#171820",
  hairLight: "#272a36",
  eyeWhite: "#f8f3ec",
  iris: "#3a241b",
  pupil: "#09090c",
  lip: "#9c5a55",
  shirt: "#eee7da",
  overshirt: "#252833",
  overshirtEdge: "#343847",
  trousers: "#182542",
  cobalt: "#345cff",
  shoe: "#eee9df",
  sole: "#cfc9bd",
};

function material(name, color, roughness = 0.66, metalness = 0) {
  const value = new THREE.MeshStandardMaterial({
    name,
    color,
    roughness,
    metalness,
  });
  value.envMapIntensity = 0.7;
  return value;
}

const materials = {
  skin: material("柔和肤色", palette.skin, 0.72),
  skinWarm: material("肤色阴影", palette.skinWarm, 0.76),
  hair: material("黑色层次短发", palette.hair, 0.5),
  hairLight: material("发丝高光", palette.hairLight, 0.46),
  eyeWhite: material("眼白", palette.eyeWhite, 0.3),
  iris: material("深棕虹膜", palette.iris, 0.28),
  pupil: material("瞳孔", palette.pupil, 0.24),
  lip: material("自然唇色", palette.lip, 0.68),
  shirt: material("暖白内搭", palette.shirt, 0.82),
  overshirt: material("炭黑外套", palette.overshirt, 0.78),
  overshirtEdge: material("外套结构线", palette.overshirtEdge, 0.72),
  trousers: material("深蓝长裤", palette.trousers, 0.76),
  cobalt: material("钴蓝个人标记", palette.cobalt, 0.38, 0.04),
  shoe: material("米白鞋面", palette.shoe, 0.74),
  sole: material("鞋底", palette.sole, 0.84),
};

function addMesh(
  parent,
  name,
  geometry,
  meshMaterial,
  {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    castShadow = true,
  } = {},
) {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.set(...scale);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function roundedBox(width, height, depth, radius = 0.12) {
  return new RoundedBoxGeometry(width, height, depth, 5, radius);
}

function capsule(radius, length, radialSegments = 16) {
  return new THREE.CapsuleGeometry(radius, length, 8, radialSegments);
}

function createEye(name, x) {
  const eye = new THREE.Group();
  eye.name = name;
  eye.position.set(x, 0.08, 0.59);

  addMesh(
    eye,
    `${name}眼白`,
    new THREE.SphereGeometry(1, 24, 16),
    materials.eyeWhite,
    { scale: [0.17, 0.105, 0.078] },
  );
  addMesh(
    eye,
    `${name}虹膜`,
    new THREE.SphereGeometry(1, 20, 14),
    materials.iris,
    { position: [0, 0, 0.072], scale: [0.058, 0.058, 0.026] },
  );
  addMesh(
    eye,
    `${name}瞳孔`,
    new THREE.SphereGeometry(1, 16, 12),
    materials.pupil,
    { position: [0, 0, 0.092], scale: [0.027, 0.027, 0.014] },
  );
  addMesh(
    eye,
    `${name}眼神高光`,
    new THREE.SphereGeometry(1, 12, 8),
    materials.eyeWhite,
    {
      position: [-0.017, 0.02, 0.104],
      scale: [0.009, 0.009, 0.007],
      castShadow: false,
    },
  );
  return eye;
}

function createCharacter() {
  const scene = new THREE.Scene();
  scene.name = "椿襄动画写实角色";

  const character = new THREE.Group();
  character.name = "CharacterRoot";
  scene.add(character);

  const body = new THREE.Group();
  body.name = "BodyRoot";
  character.add(body);

  addMesh(
    body,
    "颈部",
    capsule(0.2, 0.3),
    materials.skin,
    { position: [0, 1.22, 0] },
  );

  addMesh(
    body,
    "米白内搭",
    roundedBox(1.08, 1.48, 0.52, 0.2),
    materials.shirt,
    { position: [0, 0.36, 0] },
  );

  addMesh(
    body,
    "左侧外套",
    roundedBox(0.46, 1.56, 0.2, 0.08),
    materials.overshirt,
    { position: [-0.34, 0.35, 0.34], rotation: [0, 0.025, -0.015] },
  );
  addMesh(
    body,
    "右侧外套",
    roundedBox(0.46, 1.56, 0.2, 0.08),
    materials.overshirt,
    { position: [0.34, 0.35, 0.34], rotation: [0, -0.025, 0.015] },
  );
  addMesh(
    body,
    "外套胸袋",
    roundedBox(0.26, 0.3, 0.032, 0.025),
    materials.overshirtEdge,
    { position: [0.36, 0.48, 0.456] },
  );
  for (const [index, y] of [0.62, 0.26, -0.1].entries()) {
    addMesh(
      body,
      `外套纽扣${index + 1}`,
      new THREE.SphereGeometry(0.028, 12, 8),
      materials.hair,
      { position: [-0.115, y, 0.47], scale: [1, 1, 0.55] },
    );
  }
  addMesh(
    body,
    "左衣领",
    new THREE.ConeGeometry(0.22, 0.5, 3),
    materials.overshirtEdge,
    {
      position: [-0.24, 0.98, 0.5],
      rotation: [0.04, 0.08, -0.2],
      scale: [0.8, 1, 0.45],
    },
  );
  addMesh(
    body,
    "右衣领",
    new THREE.ConeGeometry(0.22, 0.5, 3),
    materials.overshirtEdge,
    {
      position: [0.24, 0.98, 0.5],
      rotation: [0.04, -0.08, 0.2],
      scale: [0.8, 1, 0.45],
    },
  );
  addMesh(
    body,
    "个人圆点标记",
    new THREE.CylinderGeometry(0.16, 0.16, 0.026, 36),
    materials.cobalt,
    {
      position: [0, 0.48, 0.48],
      rotation: [Math.PI / 2, 0, 0],
    },
  );

  for (const side of [-1, 1]) {
    const sideName = side < 0 ? "左" : "右";
    addMesh(
      body,
      `${sideName}手臂`,
      capsule(0.18, 1.12),
      materials.overshirt,
      {
        position: [side * 0.76, 0.22, 0],
        rotation: [0, 0, side * -0.08],
      },
    );
    addMesh(
      body,
      `${sideName}手`,
      capsule(0.135, 0.26, 14),
      materials.skin,
      {
        position: [side * 0.83, -0.57, 0.015],
        rotation: [0, 0, side * -0.05],
        scale: [0.92, 1, 0.72],
      },
    );
  }

  addMesh(
    body,
    "裤腰",
    roundedBox(1.02, 0.43, 0.49, 0.14),
    materials.trousers,
    { position: [0, -0.68, 0] },
  );

  for (const side of [-1, 1]) {
    const sideName = side < 0 ? "左" : "右";
    addMesh(
      body,
      `${sideName}腿`,
      capsule(0.235, 1.25),
      materials.trousers,
      {
        position: [side * 0.29, -1.5, 0],
        scale: [0.95, 1, 0.88],
      },
    );
    addMesh(
      body,
      `${sideName}鞋面`,
      roundedBox(0.48, 0.27, 0.78, 0.11),
      materials.shoe,
      {
        position: [side * 0.29, -2.3, 0.13],
        scale: [1, 1, 1],
      },
    );
    addMesh(
      body,
      `${sideName}鞋底`,
      roundedBox(0.51, 0.09, 0.82, 0.035),
      materials.sole,
      { position: [side * 0.29, -2.47, 0.14] },
    );
  }

  const head = new THREE.Group();
  head.name = "HeadRoot";
  head.position.set(0, 1.83, 0.03);
  body.add(head);

  addMesh(
    head,
    "面部主体",
    new THREE.SphereGeometry(1, 32, 24),
    materials.skin,
    { scale: [0.68, 0.82, 0.62] },
  );
  addMesh(
    head,
    "下颌",
    new THREE.SphereGeometry(1, 28, 20),
    materials.skin,
    {
      position: [0, -0.36, 0.015],
      scale: [0.55, 0.5, 0.54],
    },
  );
  addMesh(
    head,
    "左耳",
    new THREE.SphereGeometry(1, 18, 14),
    materials.skinWarm,
    {
      position: [-0.68, -0.02, -0.005],
      scale: [0.13, 0.22, 0.09],
    },
  );
  addMesh(
    head,
    "右耳",
    new THREE.SphereGeometry(1, 18, 14),
    materials.skinWarm,
    {
      position: [0.68, -0.02, -0.005],
      scale: [0.13, 0.22, 0.09],
    },
  );

  head.add(createEye("LeftEye", -0.235));
  head.add(createEye("RightEye", 0.235));

  addMesh(
    head,
    "鼻梁",
    new THREE.SphereGeometry(1, 18, 14),
    materials.skinWarm,
    {
      position: [0, -0.08, 0.61],
      scale: [0.072, 0.155, 0.09],
    },
  );
  addMesh(
    head,
    "鼻尖",
    new THREE.SphereGeometry(1, 18, 14),
    materials.skinWarm,
    {
      position: [0, -0.2, 0.67],
      scale: [0.096, 0.064, 0.075],
    },
  );
  addMesh(
    head,
    "嘴唇",
    capsule(0.026, 0.19, 16),
    materials.lip,
    {
      position: [0, -0.43, 0.59],
      rotation: [0, 0, Math.PI / 2],
      scale: [1, 1, 0.62],
    },
  );

  for (const side of [-1, 1]) {
    const sideName = side < 0 ? "左" : "右";
    addMesh(
      head,
      `${sideName}眉`,
      capsule(0.025, 0.22, 12),
      materials.hair,
      {
        position: [side * 0.24, 0.28, 0.6],
        rotation: [0, 0, Math.PI / 2 + side * 0.08],
        scale: [1, 1, 0.55],
      },
    );
  }

  const hairBack = [
    [0, 0.55, -0.12, 0.7, 0.48, 0.55],
    [-0.38, 0.43, -0.05, 0.42, 0.5, 0.45],
    [0.38, 0.43, -0.05, 0.42, 0.5, 0.45],
    [-0.52, 0.16, -0.05, 0.28, 0.44, 0.35],
    [0.52, 0.16, -0.05, 0.28, 0.44, 0.35],
  ];
  hairBack.forEach(([x, y, z, sx, sy, sz], index) => {
    addMesh(
      head,
      `后层头发${index + 1}`,
      new THREE.IcosahedronGeometry(1, 2),
      index % 2 ? materials.hairLight : materials.hair,
      { position: [x, y, z], scale: [sx, sy, sz] },
    );
  });

  const bangs = [
    [-0.46, 0.38, 0.45, -0.34, 0.42],
    [-0.26, 0.42, 0.54, -0.2, 0.5],
    [-0.07, 0.43, 0.57, -0.08, 0.54],
    [0.12, 0.42, 0.56, 0.12, 0.5],
    [0.31, 0.38, 0.5, 0.28, 0.44],
    [0.46, 0.31, 0.4, 0.38, 0.36],
  ];
  bangs.forEach(([x, y, z, angle, length], index) => {
    addMesh(
      head,
      `前额发束${index + 1}`,
      capsule(0.075, length, 12),
      index % 2 ? materials.hairLight : materials.hair,
      {
        position: [x, y, z],
        rotation: [0.36, 0, angle],
        scale: [0.75, 1, 0.58],
      },
    );
  });

  character.position.y = 0.08;
  character.rotation.y = -0.06;
  return scene;
}

await mkdir(path.dirname(outputPath), { recursive: true });
const scene = createCharacter();
scene.updateMatrixWorld(true);

const exporter = new GLTFExporter();
const binary = await exporter.parseAsync(scene, {
  binary: true,
  onlyVisible: true,
  trs: true,
});

await writeFile(outputPath, Buffer.from(binary));
console.log(outputPath);
