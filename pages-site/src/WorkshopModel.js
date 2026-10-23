/** A small, explorable architectural study of software systems. */
export function createWorkshop(THREE) {
  const group = new THREE.Group();
  group.name = 'Chunxiang — workshop study';

  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const geometryCache = new Map();
  const edgeCache = new Map();
  const floors = [];
  const facades = [];
  const indicatorLights = [];
  let disposed = false;

  const color = {
    cream: 0xf5f0df,
    ivory: 0xfffbef,
    blue: 0x214fce,
    deep: 0x163a98,
    pale: 0xaac5ee,
    graphite: 0x343f59,
    wood: 0xdcc3a0,
  };
  const retainGeometry = (value) => (geometries.add(value), value);
  const retainMaterial = (value) => (materials.add(value), value);
  const material = (value, extra = {}) => retainMaterial(new THREE.MeshStandardMaterial({
    color: value, roughness: .78, metalness: .04, ...extra,
  }));
  const mat = {
    cream: material(color.cream),
    ivory: material(color.ivory),
    blue: material(color.blue, {roughness: .64}),
    deep: material(color.deep),
    pale: material(color.pale),
    graphite: material(color.graphite),
    wood: material(color.wood),
    glass: material(0xbad3f4, {transparent: true, opacity: .32, roughness: .19, depthWrite: false}),
    glazing: material(0x235bad, {roughness: .17, metalness: .27}),
    acrylic: material(0xb8d7ee, {transparent: true, opacity: .48, roughness: .12, metalness: .12, depthWrite: false}),
    metal: material(0xd8e0df, {roughness: .32, metalness: .48}),
    windowFrame: retainMaterial(new THREE.LineBasicMaterial({color: 0xe6eee9, transparent: true, opacity: .86})),
    line: retainMaterial(new THREE.LineBasicMaterial({color: color.blue, transparent: true, opacity: .72})),
    softLine: retainMaterial(new THREE.LineBasicMaterial({color: 0x7aa4e7, transparent: true, opacity: .55})),
  };

  function cachedGeometry(key, make) {
    if (!geometryCache.has(key)) geometryCache.set(key, retainGeometry(make()));
    return geometryCache.get(key);
  }

  function addMesh(parent, geometry, surface, position = [0, 0, 0], outlined = false) {
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    if (outlined) {
      if (!edgeCache.has(geometry)) edgeCache.set(geometry, retainGeometry(new THREE.EdgesGeometry(geometry, 22)));
      const edges = new THREE.LineSegments(edgeCache.get(geometry), mat.line);
      edges.name = 'Cobalt construction edges';
      mesh.add(edges);
    }
    return mesh;
  }

  function box(parent, w, h, d, position, surface = mat.cream, outlined = false) {
    const geometry = cachedGeometry(`box:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d));
    return addMesh(parent, geometry, surface, position, outlined);
  }

  function cylinder(parent, rt, rb, h, position, surface = mat.cream, sides = 12) {
    const geometry = cachedGeometry(`cyl:${rt}:${rb}:${h}:${sides}`, () => new THREE.CylinderGeometry(rt, rb, h, sides));
    return addMesh(parent, geometry, surface, position);
  }

  function line(parent, points, surface = mat.line) {
    const geometry = retainGeometry(new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p))));
    const result = new THREE.Line(geometry, surface);
    parent.add(result);
    return result;
  }

  function canvasTexture(width, height, draw) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    draw(ctx, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    textures.add(texture);
    return texture;
  }

  function surfacePlane(parent, width, depth, position, texture, fallback = color.cream) {
    const surface = material(fallback, texture ? {map: texture} : {});
    const geometry = cachedGeometry(`plane:${width}:${depth}`, () => new THREE.PlaneGeometry(width, depth));
    const plane = addMesh(parent, geometry, surface, position);
    plane.rotation.x = -Math.PI / 2;
    plane.castShadow = false;
    return plane;
  }

  // Finite cobalt model board, with a pale reveal under its edge.
  box(group, 11.6, .23, 8.6, [0, -.125, 0], mat.blue, true);
  box(group, 11.35, .055, 8.35, [0, -.2675, 0], mat.cream);
  box(group, 10.7, .035, 7.65, [-.08, .0125, -.12], mat.pale);
  box(group, 8.3, .055, 6.7, [-.8, .0575, -.35], mat.cream, true);

  // Board registration marks, all drawn on the model rather than an infinite floor.
  for (const [x, z] of [[-5.35, -3.9], [5.35, -3.9], [-5.35, 3.9], [5.35, 3.9]]) {
    line(group, [[x - .15, .008, z], [x + .15, .008, z]], mat.softLine);
    line(group, [[x, .008, z - .15], [x, .008, z + .15]], mat.softLine);
  }
  for (let i = 0; i <= 10; i++) {
    const x = -5 + i;
    line(group, [[x, .011, 4.02], [x, .011, i % 5 ? 4.11 : 4.22]], mat.softLine);
  }

  const buildings = new THREE.Group();
  buildings.name = 'Exploded architectural assembly';
  group.add(buildings);

  function ringSlab(parent, width, depth, y, hole = .7) {
    const stripDepth = (depth - hole) / 2;
    const stripWidth = (width - hole) / 2;
    box(parent, width, .105, stripDepth, [0, y, (hole + stripDepth) / 2], mat.ivory, true);
    box(parent, width, .105, stripDepth, [0, y, -(hole + stripDepth) / 2], mat.ivory, true);
    box(parent, stripWidth, .105, hole, [(hole + stripWidth) / 2, y, 0], mat.ivory, true);
    box(parent, stripWidth, .105, hole, [-(hole + stripWidth) / 2, y, 0], mat.ivory, true);
  }

  function furniture(parent, x, z, orientation = 0) {
    const room = new THREE.Group();
    room.position.set(x, .07, z);
    room.rotation.y = orientation;
    parent.add(room);
    box(room, .47, .045, .24, [0, .27, 0], mat.ivory, true);
    box(room, .035, .25, .035, [-.18, .13, 0], mat.deep);
    box(room, .035, .25, .035, [.18, .13, 0], mat.deep);
    box(room, .19, .035, .19, [0, .13, .27], mat.blue);
    box(room, .19, .18, .025, [0, .23, .35], mat.blue);
    box(room, .025, .12, .025, [0, .06, .27], mat.deep);
    box(room, .18, .11, .025, [0, .35, -.03], mat.pale, true);
  }

  function addStair(parent, x, z, count, rise, run, width, rotate = 0) {
    const stair = new THREE.Group();
    stair.position.set(x, 0, z);
    stair.rotation.y = rotate;
    parent.add(stair);
    for (let i = 0; i < count; i++) {
      box(stair, width, rise * (i + 1), run, [0, rise * (i + 1) / 2, (i - (count - 1) / 2) * run], i % 2 ? mat.blue : mat.deep);
    }
    return stair;
  }

  function glazingRibbon(parent, span, height, side = false) {
    const bandHeight = height * .36;
    const bandWidth = span - .16;
    const surface = side
      ? box(parent, .018, bandHeight, bandWidth, [.047, .045, 0], mat.glazing)
      : box(parent, bandWidth, bandHeight, .018, [0, .045, .047], mat.glazing);
    surface.name = 'Recessed continuous blue glazing';
    surface.castShadow = false;
    // Every ribbon shares one normalized set of thin mullions and perimeter rails.
    const frameGeometry = cachedGeometry('window-ribbon:6', () => {
      const points = [];
      const segment = (ax, ay, bx, by) => points.push(ax, ay, 0, bx, by, 0);
      segment(-.5, -.5, .5, -.5); segment(-.5, .5, .5, .5);
      for (let i = 0; i <= 6; i++) segment(-.5 + i / 6, -.5, -.5 + i / 6, .5);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      return geometry;
    });
    const frame = new THREE.LineSegments(frameGeometry, mat.windowFrame);
    frame.name = 'Fine glazing mullions';
    frame.scale.set(bandWidth, bandHeight, 1);
    frame.position.set(side ? .058 : 0, .045, side ? 0 : .058);
    if (side) frame.rotation.y = Math.PI / 2;
    parent.add(frame);
  }

  function roofLantern(parent, y) {
    box(parent, .66, .062, 1.12, [0, y + .031, -.12], mat.deep, true);
    const glassGeometry = cachedGeometry('barrel-vault:.25:.95', () => {
      const shape = new THREE.Shape();
      shape.moveTo(-.25, 0);
      shape.lineTo(.25, 0);
      shape.absarc(0, 0, .25, 0, Math.PI, false);
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, {depth: .95, bevelEnabled: false, curveSegments: 20});
    });
    const vault = addMesh(parent, glassGeometry, mat.acrylic, [0, y + .062, -.595]);
    vault.name = 'Curved glass roof lantern';
    vault.castShadow = false;
    const ribGeometry = cachedGeometry('roof-lantern:metal-rib', () => {
      const points = Array.from({length: 25}, (_, i) => {
        const angle = i / 24 * Math.PI;
        return new THREE.Vector3(Math.cos(angle) * .255, Math.sin(angle) * .255, 0);
      });
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, .012, 6, false);
    });
    for (const z of [-.595, -.12, .355]) addMesh(parent, ribGeometry, mat.metal, [0, y + .062, z]);
    box(parent, .026, .026, .98, [-.255, y + .066, -.12], mat.metal);
    box(parent, .026, .026, .98, [.255, y + .066, -.12], mat.metal);
  }

  function building({x, z, width, depth, levels, pitch, step, id}) {
    const assembly = new THREE.Group();
    assembly.name = id;
    assembly.position.set(x, .16, z);
    buildings.add(assembly);
    box(assembly, width + .22, .13, depth + .22, [0, -.005, 0], mat.ivory, true);

    for (let level = 0; level < levels; level++) {
      const floor = new THREE.Group();
      const w = width - step * level;
      const d = depth - step * level * .6;
      const restY = .12 + level * pitch;
      floor.position.set(0, restY, -.045 * level);
      floor.name = `${id} / level ${level + 1}`;
      assembly.add(floor);
      floors.push({node: floor, restY, level, total: levels, phase: id === 'Main stepped tower' ? 0 : .035});

      if (id === 'Main stepped tower') ringSlab(floor, w, d, 0, .68);
      else box(floor, w, .105, d, [0, 0, 0], mat.ivory, true);

      const clearHeight = pitch - .14;
      const wallY = clearHeight / 2 + .06;
      // Solid outer volumes read first; the front and right skins retract during dissection.
      box(floor, w - .13, clearHeight, .07, [0, wallY, -d / 2 + .06], mat.cream, true);
      box(floor, .07, clearHeight, d - .12, [-w / 2 + .06, wallY, 0], mat.ivory, true);
      box(floor, .055, clearHeight * .88, d * .29, [w / 2 - .06, wallY, -d * .23], mat.glass);

      const facadeHeight = pitch - .095;
      const facadeY = pitch / 2;
      const front = box(floor, w + .02, facadeHeight, .075, [0, facadeY, d / 2 - .025], mat.cream, true);
      const side = box(floor, .075, facadeHeight, d + .02, [w / 2 - .025, facadeY, 0], mat.ivory, true);
      front.name = `${id} / front envelope ${level + 1}`;
      side.name = `${id} / side envelope ${level + 1}`;
      glazingRibbon(front, w, facadeHeight);
      glazingRibbon(side, d, facadeHeight, true);
      facades.push(
        {node: front, restY: facadeY, height: facadeHeight, axis: 'z', rest: d / 2 - .025},
        {node: side, restY: facadeY, height: facadeHeight, axis: 'x', rest: w / 2 - .025},
      );

      for (const cx of [-w / 2 + .085, w / 2 - .085]) {
        box(floor, .075, clearHeight, .075, [cx, wallY, d / 2 - .095], mat.ivory, true);
      }

      // Narrow cobalt reveals read as windows rather than a stack of abstract boxes.
      const windowCount = Math.max(2, Math.floor(w / .43));
      for (let window = 0; window < windowCount; window++) {
        box(floor, .21, clearHeight * .43, .017, [(-w / 2 + .24) + window * ((w - .48) / (windowCount - 1)), wallY + .06, -d / 2 + .014], mat.blue);
      }
      if (level < 2) furniture(floor, w * .19, d * .17, -.08);
      if (id === 'Main stepped tower' && level < levels - 1) {
        addStair(floor, -w * .23, -.12, 7, pitch / 7, .105, .37, Math.PI / 2);
      }

      // Stepped roofs and balcony rails remain visible from every orbit angle.
      if (level === levels - 1) {
        box(floor, w + .1, .115, d + .1, [0, pitch - .045, 0], mat.ivory, true);
        for (let rib = 0; rib < 4; rib++) {
          box(floor, .022, .012, d * .74, [(-1.5 + rib) * w * .18, pitch + .018, 0], mat.pale);
        }
        if (id === 'Main stepped tower') {
          roofLantern(floor, pitch + .012);
        } else {
          box(floor, w * .4, .07, d * .22, [w * .12, pitch + .04, -d * .18], mat.blue, true);
          if (id === 'System annex') {
            const vent = cylinder(floor, .135, .135, .52, [-w * .19, pitch + .17, d * .1], mat.metal, 20);
            vent.rotation.x = Math.PI / 2;
            box(floor, .32, .06, .61, [-w * .19, pitch + .035, d * .1], mat.deep);
          }
        }
      } else {
        box(floor, w * .64, .028, .028, [0, .25, d / 2 - .03], mat.blue);
        box(floor, .025, .22, .025, [-w * .31, .14, d / 2 - .03], mat.blue);
        box(floor, .025, .22, .025, [w * .31, .14, d / 2 - .03], mat.blue);
      }
    }
    return assembly;
  }

  building({x: -1.36, z: -.73, width: 2.35, depth: 2.3, levels: 4, pitch: .77, step: .17, id: 'Main stepped tower'});
  building({x: .96, z: -.95, width: 1.8, depth: 1.87, levels: 3, pitch: .67, step: .12, id: 'System annex'});
  building({x: -2.49, z: 1.31, width: 1.65, depth: 1.38, levels: 2, pitch: .64, step: .1, id: 'Studio annex'});
  building({x: -.3, z: 1.28, width: 2.02, depth: 1.4, levels: 1, pitch: .72, step: 0, id: 'Open workshop'});

  // A blue service core becomes legible when the floor plates separate.
  const core = new THREE.Group();
  core.name = 'Visible system core';
  core.position.set(-1.36, .3, -.73);
  group.add(core);
  const coreSurface = material(color.blue, {emissive: color.blue, emissiveIntensity: .08, roughness: .45});
  box(core, .43, 2.4, .43, [0, 1.2, 0], coreSurface, true);
  for (let i = 0; i < 5; i++) {
    box(core, .53, .045, .53, [0, .28 + i * .47, 0], mat.pale, true);
    box(core, .25, .055, .015, [0, .38 + i * .47, .224], mat.ivory);
  }
  cylinder(core, .17, .17, .12, [0, 2.48, 0], mat.ivory, 16);

  // Exterior approach is part of the physical maquette.
  addStair(group, -.3, 2.27, 5, .055, .12, 1.15);
  box(group, 1.26, .055, .12, [-.3, .292, 1.97], mat.ivory, true);

  // Curved construction samples anchor the right foreground without hiding the tower.
  // Their physical thickness makes the camera's near-to-far movement readable.
  const samples = new THREE.Group();
  samples.name = 'Foreground / curved construction study';
  samples.position.set(2.08, .085, 3.3);
  group.add(samples);
  box(samples, 1.98, .105, 1.62, [0, .0525, 0], mat.ivory, true);

  function arcSection(radius, thickness, height) {
    return cachedGeometry(`arc:${radius}:${thickness}:${height}`, () => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, radius, 0, Math.PI, false);
      shape.absarc(0, 0, radius - thickness, Math.PI, 0, true);
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, {depth: height, bevelEnabled: false, curveSegments: 24});
      geometry.rotateX(-Math.PI / 2);
      return geometry;
    });
  }

  const curvedWall = addMesh(samples, arcSection(.75, .105, .52), mat.blue, [0, .105, .015], true);
  curvedWall.name = 'Cobalt curved wall section';
  addMesh(samples, arcSection(.78, .16, .045), mat.ivory, [0, .625, .015], true);
  const acrylicSection = addMesh(samples, arcSection(.54, .035, .75), mat.acrylic, [0, .105, .015], true);
  acrylicSection.name = 'Transparent acrylic section';
  acrylicSection.castShadow = false;
  addMesh(samples, arcSection(.545, .045, .022), mat.metal, [0, .855, .015]);
  for (let step = 0; step < 3; step++) {
    box(samples, 1.02 - step * .1, .055 + step * .055, .2, [0, (.055 + step * .055) / 2 + .105, .62 - step * .2], step === 1 ? mat.blue : mat.ivory, true);
  }

  // A small, tangible notebook: the photograph is supplied by the owning scene.
  const notebook = new THREE.Group();
  notebook.name = 'Open paper notebook';
  notebook.position.set(-1.48, .112, 3.14);
  notebook.rotation.y = -.065;
  group.add(notebook);
  const coverGeometry = cachedGeometry('notebook-cover:3.28:2.07', () => {
    const w = 3.28, d = 2.07, r = .065;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -d / 2);
    shape.lineTo(w / 2 - r, -d / 2);
    shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
    shape.lineTo(w / 2, d / 2 - r);
    shape.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
    shape.lineTo(-w / 2 + r, d / 2);
    shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
    shape.lineTo(-w / 2, -d / 2 + r);
    shape.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
    const geometry = new THREE.ExtrudeGeometry(shape, {depth: .045, bevelEnabled: true, bevelSize: .006, bevelThickness: .004, bevelSegments: 2, curveSegments: 8});
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  });
  addMesh(notebook, coverGeometry, mat.blue);
  const spine = cylinder(notebook, .071, .071, 2.035, [0, .046, 0], mat.deep, 16);
  spine.rotation.x = Math.PI / 2;

  const leftPage = new THREE.Group();
  leftPage.name = 'Notebook / portrait page';
  leftPage.position.set(-.82, .12, 0);
  notebook.add(leftPage);
  const rightPage = new THREE.Group();
  rightPage.name = 'Notebook / sketch page';
  rightPage.position.set(.82, .12, 0);
  notebook.add(rightPage);
  const pageEdges = retainMaterial(new THREE.LineBasicMaterial({color: 0xc9bfa7, transparent: true, opacity: .48}));
  const leafEdgeGeometry = cachedGeometry('notebook:leaf-edges', () => {
    const points = [];
    for (const y of [-.056, -.037, -.018]) {
      points.push(-.75, y, .981, .75, y, .981);
      points.push(-.751, y, -.98, -.751, y, .98);
      points.push(.751, y, -.98, .751, y, .98);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  });
  for (const page of [leftPage, rightPage]) {
    box(page, 1.5, .07, 1.96, [0, -.035, 0], mat.ivory);
    page.add(new THREE.LineSegments(leafEdgeGeometry, pageEdges));
  }

  const portraitPageTexture = canvasTexture(750, 980, (ctx, w, h) => {
    ctx.fillStyle = '#fffbee'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#405d89'; ctx.font = '29px "Songti SC", serif';
    ctx.fillText('椿襄', 61, 68);
    ctx.strokeStyle = '#d2cbb8'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, 884); ctx.lineTo(279, 884); ctx.stroke();
  });
  surfacePlane(leftPage, 1.5, 1.96, [0, .0015, 0], portraitPageTexture, color.ivory);

  // The white mounting border stays visible around a 1.0 × 1.25 portrait.
  box(leftPage, 1.14, .012, 1.42, [0, .008, -.05], mat.ivory);
  const portraitAnchor = new THREE.Group();
  portraitAnchor.name = 'Notebook portrait anchor / XY';
  portraitAnchor.position.set(0, .017, -.1);
  portraitAnchor.rotation.x = -Math.PI / 2;
  portraitAnchor.userData.width = 1;
  portraitAnchor.userData.height = 1.25;
  portraitAnchor.userData.surface = 'XY plane, local +Z faces upward';
  leftPage.add(portraitAnchor);

  const tapeMaterial = material(0xe7d8b2, {transparent: true, opacity: .79, roughness: .94, metalness: 0});
  for (const [x, z, angle] of [[-.43, -.72, -.26], [.43, .54, .2]]) {
    const tape = box(leftPage, .34, .004, .13, [x, .023, z], tapeMaterial);
    tape.rotation.y = angle;
    tape.castShadow = false;
  }

  const notesTexture = canvasTexture(750, 980, (ctx, w, h) => {
    ctx.fillStyle = '#fffbee'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#405d89'; ctx.font = '29px "Songti SC", serif';
    ctx.fillText('手记', 67, 70);
    ctx.strokeStyle = '#d9dfdf'; ctx.lineWidth = 1;
    for (let y = 142; y < 890; y += 47) {ctx.beginPath(); ctx.moveTo(63, y); ctx.lineTo(681, y); ctx.stroke();}
    ctx.strokeStyle = '#426aa0'; ctx.lineWidth = 2.4;
    // A compact spatial sketch and a short execution chain, without invented personal notes.
    ctx.beginPath();
    ctx.moveTo(181, 285); ctx.lineTo(350, 200); ctx.lineTo(565, 307); ctx.lineTo(395, 394); ctx.closePath();
    ctx.moveTo(181, 285); ctx.lineTo(181, 425); ctx.lineTo(395, 533); ctx.lineTo(565, 447); ctx.lineTo(565, 307);
    ctx.moveTo(395, 394); ctx.lineTo(395, 533);
    ctx.moveTo(209, 350); ctx.lineTo(366, 429); ctx.moveTo(209, 381); ctx.lineTo(366, 460);
    ctx.stroke();
    ctx.lineWidth = 1.4;
    ctx.setLineDash([7, 8]);
    ctx.beginPath(); ctx.moveTo(350, 200); ctx.lineTo(350, 341); ctx.lineTo(181, 425); ctx.moveTo(350, 341); ctx.lineTo(565, 447); ctx.stroke();
    ctx.setLineDash([]);
    for (const x of [185, 375, 565]) {ctx.beginPath(); ctx.arc(x, 694, 24, 0, Math.PI * 2); ctx.stroke();}
    ctx.beginPath(); ctx.moveTo(209, 694); ctx.lineTo(351, 694); ctx.moveTo(399, 694); ctx.lineTo(541, 694); ctx.stroke();
    ctx.font = '22px "Songti SC", serif'; ctx.fillText('观察', 163, 751); ctx.fillText('验证', 353, 751); ctx.fillText('再试', 543, 751);
  });
  surfacePlane(rightPage, 1.5, 1.96, [0, .0015, 0], notesTexture, color.ivory);
  // A short cloth bookmark remains on the board, not a floating decoration.
  box(notebook, .075, .008, .14, [.065, .048, 1.04], mat.pale);

  function pencil(x, z, angle, length) {
    const pencilGroup = new THREE.Group();
    pencilGroup.name = 'Drafting pencil';
    pencilGroup.position.set(x, .16, z);
    pencilGroup.rotation.y = angle;
    group.add(pencilGroup);
    const body = cylinder(pencilGroup, .055, .055, length, [0, 0, 0], mat.blue, 6);
    body.rotation.z = Math.PI / 2;
    const wood = cylinder(pencilGroup, 0, .055, .25, [length / 2 + .125, 0, 0], mat.wood, 6);
    wood.rotation.z = -Math.PI / 2;
    const lead = cylinder(pencilGroup, 0, .021, .105, [length / 2 + .26, 0, 0], mat.graphite, 6);
    lead.rotation.z = -Math.PI / 2;
    const cap = cylinder(pencilGroup, .056, .056, .1, [-length / 2 - .05, 0, 0], mat.ivory, 6);
    cap.rotation.z = Math.PI / 2;
  }
  pencil(-4.14, 3.05, .31, 1.8);
  pencil(-4.18, 3.36, .16, 1.95);

  const ruler = new THREE.Group();
  ruler.position.set(-4.63, .1, 1.38);
  ruler.rotation.y = -.2;
  group.add(ruler);
  box(ruler, .38, .035, 2.15, [0, 0, 0], mat.ivory, true);
  for (let i = 0; i < 17; i++) line(ruler, [[-.19, .019, -.96 + i * .12], [i % 4 ? -.08 : .02, .019, -.96 + i * .12]], mat.line);

  function tree(x, z, height, variant = 0) {
    const treeGroup = new THREE.Group();
    treeGroup.name = 'Geometric model tree';
    treeGroup.position.set(x, .095, z);
    group.add(treeGroup);
    cylinder(treeGroup, .28, .32, .055, [0, .0275, 0], mat.ivory, 20);
    cylinder(treeGroup, .038, .052, height * .64, [0, height * .32, 0], mat.deep, 7);
    if (variant === 0) {
      const crown = cachedGeometry('tree:icosahedron', () => new THREE.IcosahedronGeometry(1, 0));
      const blueCrown = addMesh(treeGroup, crown, mat.blue, [-.09, height * .74, .01]);
      blueCrown.scale.set(height * .34, height * .42, height * .33);
      const whiteCrown = addMesh(treeGroup, crown, mat.ivory, [.18, height * .64, .12]);
      whiteCrown.scale.set(height * .23, height * .31, height * .24);
    } else {
      cylinder(treeGroup, 0, height * .35, height * .72, [0, height * .72, 0], mat.blue, 6);
      cylinder(treeGroup, 0, height * .26, height * .55, [0, height * .94, 0], mat.ivory, 6);
    }
  }
  tree(-4.25, -2.75, 1.12);
  tree(-4.19, -.73, .86, 1);
  tree(2.51, -2.81, .92);
  tree(-3.65, 1.27, .67, 1);

  // Engineering desk: a circuit substrate, a small rack and routed physical tubes.
  const electronics = new THREE.Group();
  electronics.name = 'System model / execution hardware';
  electronics.position.set(4.04, .12, .63);
  group.add(electronics);
  box(electronics, 2.6, .11, 3.36, [0, .055, 0], mat.ivory, true);
  const circuitTexture = canvasTexture(720, 960, (ctx, w, h) => {
    ctx.fillStyle = '#214fce'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#b8d2fa'; ctx.lineWidth = 3;
    const routes = [
      [70, 80, 70, 260, 250, 260, 250, 440], [145, 80, 145, 190, 360, 190, 360, 520],
      [650, 110, 580, 110, 580, 350, 450, 350], [640, 780, 520, 780, 520, 590, 330, 590],
      [70, 860, 70, 680, 210, 680, 210, 510], [160, 880, 160, 755, 330, 755, 330, 650],
      [620, 870, 620, 640, 580, 640, 580, 460],
    ];
    routes.forEach((p) => {
      ctx.beginPath(); ctx.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], 8, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.strokeStyle = '#799ee8'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) ctx.strokeRect(250 + i * 8, 380 + i * 8, 200 - i * 16, 190 - i * 16);
    ctx.fillStyle = '#f5f0df'; ctx.font = '23px monospace'; ctx.fillText('EXEC / 02', 55, 925);
  });
  surfacePlane(electronics, 2.42, 3.18, [0, .116, 0], circuitTexture, color.blue);
  box(electronics, .87, 1.2, .75, [.58, .73, -.59], mat.cream, true);
  box(electronics, .78, 1.07, .03, [.58, .73, -.195], mat.blue, true);
  for (let slot = 0; slot < 6; slot++) {
    box(electronics, .63, .065, .04, [.58, .31 + slot * .17, -.172], mat.ivory);
    box(electronics, .07, .025, .045, [.34, .31 + slot * .17, -.147], mat.pale);
  }
  box(electronics, .74, .26, .91, [-.49, .26, -.34], mat.deep, true);
  for (let fin = 0; fin < 6; fin++) box(electronics, .033, .23, .73, [-.76 + fin * .108, .47, -.34], mat.pale);
  box(electronics, .68, .18, .61, [-.25, .22, .79], mat.ivory, true);
  box(electronics, .37, .13, .34, [-.25, .375, .79], mat.blue, true);

  function cable(points, radius, surface) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const geometry = retainGeometry(new THREE.TubeGeometry(curve, 24, radius, 6, false));
    return addMesh(electronics, geometry, surface);
  }
  cable([[-.4, .24, .71], [-.84, .47, .47], [-.9, .48, -.08], [-.57, .36, -.29]], .026, mat.ivory);
  cable([[.02, .22, .84], [.68, .49, .91], [.96, .5, .12], [.68, .54, -.2]], .023, mat.pale);
  cable([[-.51, .22, -.72], [-.34, .6, -1.14], [.38, .6, -1.2], [.6, .82, -.96]], .022, mat.ivory);

  for (let i = 0; i < 3; i++) {
    const lightMaterial = material(0xe9f4ff, {emissive: color.pale, emissiveIntensity: .45});
    const led = cylinder(electronics, .046, .046, .028, [.55 + i * .17, .151, 1.27], lightMaterial, 12);
    indicatorLights.push({mesh: led, material: lightMaterial, index: i});
  }

  // Small physical coordinate marker, not an overlaid UI element.
  const axes = new THREE.Group();
  axes.position.set(-4.85, .045, -3.6);
  axes.name = 'Model coordinates';
  group.add(axes);
  box(axes, .65, .025, .025, [.325, 0, 0], mat.ivory);
  box(axes, .025, .025, .65, [0, 0, .325], mat.ivory);
  box(axes, .025, .47, .025, [0, .235, 0], mat.ivory);
  const xArrow = cylinder(axes, 0, .055, .12, [.69, 0, 0], mat.ivory, 6);
  xArrow.rotation.z = -Math.PI / 2;
  const zArrow = cylinder(axes, 0, .055, .12, [0, 0, .69], mat.ivory, 6);
  zArrow.rotation.x = Math.PI / 2;
  cylinder(axes, 0, .055, .12, [0, .52, 0], mat.ivory, 6);
  const axisTexture = canvasTexture(320, 96, (ctx) => {
    ctx.clearRect(0, 0, 320, 96);
    ctx.font = '34px monospace'; ctx.fillStyle = '#edf3ff'; ctx.fillText('X   Y   Z', 20, 58);
  });
  if (axisTexture) {
    const axisSurface = material(0xffffff, {map: axisTexture, transparent: true, depthWrite: false});
    const axisLabel = addMesh(axes, cachedGeometry('axis-label-plane', () => new THREE.PlaneGeometry(.75, .225)), axisSurface, [.35, .015, .9]);
    axisLabel.rotation.x = -Math.PI / 2;
    axisLabel.castShadow = false;
  }

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const ease = (progress, from, to) => {
    const t = clamp((progress - from) / (to - from));
    return t * t * (3 - 2 * t);
  };

  function update(progress) {
    if (disposed) return;
    const p = clamp(Number.isFinite(progress) ? progress : 0);
    const spread = ease(p, .27, .42) * (1 - ease(p, .66, .8));
    const facadeOpen = ease(p, .265, .405) * (1 - ease(p, .69, .805));
    const coreReveal = ease(p, .37, .54) * (1 - ease(p, .72, .84));
    for (const floor of floors) {
      const assembling = 1 - ease(p, .015 + floor.phase, .16 + floor.phase);
      const assemblyLift = assembling * (.27 + floor.level * .14);
      const explodedLift = spread * floor.level * .43;
      floor.node.position.y = floor.restY + assemblyLift + explodedLift;
      floor.node.rotation.y = assembling * (floor.level % 2 ? .035 : -.035);
    }
    // Collapse the two skins into low perimeter strips: the rooms remain unobstructed.
    for (const facade of facades) {
      facade.node.position[facade.axis] = facade.rest + facadeOpen * .24;
      facade.node.position.y = facade.restY - facade.height * .47 * facadeOpen;
      facade.node.scale.y = 1 - facadeOpen * .95;
    }
    core.position.y = .3 + coreReveal * .24;
    core.scale.set(1 + coreReveal * .06, .74 + coreReveal * .26, 1 + coreReveal * .06);
    coreSurface.emissiveIntensity = .08 + coreReveal * .23;
    indicatorLights.forEach(({mesh, material: surface, index}) => {
      const pulse = .5 + .5 * Math.sin((p * 4.5 - index * .22) * Math.PI * 2);
      mesh.scale.setScalar(.88 + pulse * .18);
      surface.emissiveIntensity = .2 + pulse * .6;
    });
    group.updateMatrixWorld(true);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    group.removeFromParent();
    group.clear();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((surface) => surface.dispose());
    textures.forEach((texture) => texture.dispose());
    geometries.clear(); materials.clear(); textures.clear();
    geometryCache.clear(); edgeCache.clear();
    floors.length = 0; facades.length = 0; indicatorLights.length = 0;
  }

  update(0);
  return {group, portraitAnchor, update, dispose};
}
