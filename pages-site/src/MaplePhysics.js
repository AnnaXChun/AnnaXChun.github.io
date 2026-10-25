import {
  Body, Box, ContactMaterial, ConvexPolyhedron, FrictionEquation, GSSolver, Material, SAPBroadphase, Vec3, World,
} from 'cannon-es';

export const MAPLE_PHYSICS_STEP = 1 / 60;
export const MAPLE_PHYSICS_LIMITS = Object.freeze({ leaves: 18, textBoxes: 768, substeps: 6, speed: 2.4, angularSpeed: 5 });

const LEAF_GROUP = 1;
const TEXT_GROUP = 2;
const EPSILON = 1e-9;

// A glyph can consist of hundreds of small boxes. Cannon normally allocates a
// full gravity-based friction budget to every contact pair, so merely splitting
// a stroke into more boxes would glue a light leaf down. Share that budget
// across its actual friction pairs before the ordinary GS contact solve. This
// changes the physical Coulomb limit, never the body's pose or contact state.
class LeafContactSolver extends GSSolver {
  constructor() {
    super();
    this.pairsPerLeaf = new Map();
  }

  solve(dt, world) {
    const counts = this.pairsPerLeaf;
    counts.clear();
    for (const equation of this.equations) {
      if (!(equation instanceof FrictionEquation)) continue;
      const leaf = equation.bi.type === Body.DYNAMIC ? equation.bi : equation.bj;
      counts.set(leaf.id, (counts.get(leaf.id) ?? 0) + .5);
    }
    for (const equation of this.equations) {
      if (!(equation instanceof FrictionEquation)) continue;
      const leaf = equation.bi.type === Body.DYNAMIC ? equation.bi : equation.bj;
      const pairs = counts.get(leaf.id) ?? 1;
      equation.minForce /= pairs;
      equation.maxForce /= pairs;
    }
    return super.solve(dt, world);
  }
}

function randomGenerator(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let n = value;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function vector(value, fallback, name) {
  const result = value ?? fallback;
  if (!Array.isArray(result) || result.length !== 3 || !result.every(Number.isFinite)) {
    throw new TypeError(`${name} must be three finite numbers`);
  }
  return result;
}

// Five convex, tilted thin lobes follow the visual leaf's crown (+Y), front
// (+Z) and .196-unit curl. Their union deliberately leaves the deep notches
// empty. The small petiole is omitted from collision, not replaced by a box
// covering the entire leaf silhouette. These are collision proxies only.
const LOBES = [
  { polygon: [[0, -.18], [.14, .17], [0, .49], [-.14, .17]], curl: [0, .12, .052] },
  { polygon: [[0, -.18], [-.03, .10], [-.31, .37], [-.37, .16]], curl: [-.26, .10, .044] },
  { polygon: [[0, -.18], [.37, .16], [.31, .37], [.03, .10]], curl: [.29, .10, .044] },
  { polygon: [[0, -.18], [-.15, .07], [-.40, .09], [-.18, -.15]], curl: [-.14, -.05, .018] },
  { polygon: [[0, -.18], [.18, -.15], [.40, .09], [.15, .07]], curl: [.17, -.05, .018] },
];

function leafLobe({ polygon, curl }, scale) {
  const vertices = [];
  const count = polygon.length;
  // .026 is a conservative collision thickness, while the rendered shell is
  // thinner. Curled lobe positions, rather than a fat bounding box, give depth.
  for (const side of [-1, 1]) {
    for (const [x, y] of polygon) {
      vertices.push(new Vec3(x * scale, y * scale, (curl[0] * x + curl[1] * y + curl[2] + side * .013) * scale));
    }
  }
  const faces = [Array.from({ length: count }, (_, i) => count - 1 - i), Array.from({ length: count }, (_, i) => i + count)];
  for (let i = 0; i < count; i += 1) {
    const next = (i + 1) % count;
    faces.push([i, next, next + count, i + count]);
  }
  const offset = new Vec3();
  for (const vertex of vertices) offset.vadd(vertex, offset);
  offset.scale(1 / vertices.length, offset);
  for (const vertex of vertices) vertex.vsub(offset, vertex);
  return { shape: new ConvexPolyhedron({ vertices, faces }), offset };
}

function copyVector(source, target) {
  target[0] = source.x;
  target[1] = source.y;
  target[2] = source.z;
}

function capVector(v, limit) {
  const squared = v.lengthSquared();
  if (squared > limit * limit) v.scale(limit / Math.sqrt(squared), v);
}

/**
 * DOM-free rigid-body leaf simulation. Input boxes and output poses use the
 * same world coordinates as the foreground camera: +Y up, +Z toward camera.
 *
 * `time` in step(delta, time) is accepted for the scene adapter, but forces use
 * the fixed-step simulation clock. Hidden elapsed time therefore cannot turn
 * into a gust or a catch-up burst. Never pass total wall-clock elapsed as delta.
 *
 * `initialStates`, `windStrength`, `recycle` and `primeOnFirstText` also make
 * contact behavior reproducible in Node without exposing the Cannon world.
 */
export function createMaplePhysics({
  count = 18,
  seed = 20261025,
  halfWidth = 8,
  halfHeight = 5,
  portrait = false,
  windStrength = 1,
  gravity = [0, -2.2, 0],
  initialStates = null,
  recycle = true,
  primeOnFirstText = initialStates == null,
} = {}) {
  if (!Number.isInteger(count) || count < 1 || count > MAPLE_PHYSICS_LIMITS.leaves) {
    throw new RangeError(`count must be 1–${MAPLE_PHYSICS_LIMITS.leaves}`);
  }
  if (!(halfWidth > 0 && halfHeight > 0 && Number.isFinite(halfWidth + halfHeight))) throw new RangeError('Invalid viewport bounds');
  if (!(windStrength >= 0 && Number.isFinite(windStrength))) throw new RangeError('Invalid wind strength');
  const g = vector(gravity, [0, -2.2, 0], 'gravity');
  const world = new World({ gravity: new Vec3(...g), allowSleep: false });
  world.solver = new LeafContactSolver();
  world.broadphase = new SAPBroadphase(world);
  world.broadphase.axisIndex = 1;
  world.broadphase.useBoundingBoxes = true;
  world.solver.iterations = 12;
  world.solver.tolerance = 1e-6;
  world.narrowphase.enableFrictionReduction = true;
  world.quatNormalizeSkip = 0;
  const leafMaterial = new Material('maple-leaf');
  const textMaterial = new Material('extruded-glyph');
  const contactMaterial = new ContactMaterial(leafMaterial, textMaterial, {
    // cannon-es 0.20 GSSolver clamps its per-step lambda directly to maxForce.
    // Scale this Coulomb impulse budget by dt. The dry, curled leaf can settle
    // under a gentle breeze; gravity/contact still decide its resting pose.
    friction: .55 * MAPLE_PHYSICS_STEP,
    restitution: .01,
    contactEquationStiffness: 1e7,
    contactEquationRelaxation: 4,
    frictionEquationStiffness: 1e7,
    frictionEquationRelaxation: 4,
  });
  world.addContactMaterial(contactMaterial);
  const leaves = [];
  const poses = [];
  const leafIndex = new Map();
  const textBodies = [];
  const contactFlags = new Uint8Array(count);
  const scratchForce = new Vec3();
  const scratchTorque = new Vec3();
  const scratchNormal = new Vec3();
  const localNormal = new Vec3(0, 0, 1);
  let random = randomGenerator(seed);
  let currentKey = null;
  let textRevision = 0;
  let accumulator = 0;
  let simulatedTime = 0;
  let fixedSteps = 0;
  let droppedTime = 0;
  let recycled = 0;
  let contactCount = 0;
  let contactEvents = 0;
  let contactSteps = 0;
  let paused = false;
  let disposed = false;
  let didPrime = !primeOnFirstText;
  let supportDepth = -.45;
  let bounds = { halfWidth, halfHeight, portrait: Boolean(portrait) };

  function syncPoses() {
    for (let i = 0; i < count; i += 1) {
      const body = leaves[i].body;
      const pose = poses[i];
      copyVector(body.position, pose.position);
      copyVector(body.quaternion, pose.quaternion);
      pose.quaternion[3] = body.quaternion.w;
      copyVector(body.velocity, pose.velocity);
      copyVector(body.angularVelocity, pose.angularVelocity);
    }
    return poses;
  }

  function setScale(leaf, scale) {
    if (!(scale > 0 && Number.isFinite(scale))) throw new RangeError('Invalid leaf scale');
    while (leaf.body.shapes.length) leaf.body.removeShape(leaf.body.shapes[leaf.body.shapes.length - 1]);
    for (const lobe of LOBES) {
      const { shape, offset } = leafLobe(lobe, scale);
      leaf.body.addShape(shape, offset);
    }
    leaf.scale = scale;
    leaf.body.mass = .026 * scale * scale;
    leaf.body.updateMassProperties();
    leaf.body.aabbNeedsUpdate = true;
    poses[leaf.index].scale = scale;
  }

  function placeLeaf(leaf, state) {
    const body = leaf.body;
    // Four leaves travel through the word's physical depth. The remaining
    // leaves pass in front of it, maintaining a falling stream without a
    // contact timer, collision-mask switch or an ever-growing pile.
    const p = state?.position ?? [(random() * 1.7 - .85) * bounds.halfWidth, bounds.halfHeight + .7 + random() * bounds.halfHeight * 1.6, leaf.depth + (random() - .5) * .12];
    body.position.set(...vector(p, null, 'position'));
    body.velocity.set(...vector(state?.velocity, [.08 * (random() - .5), -.12 - random() * .16, 0], 'velocity'));
    body.angularVelocity.set(...vector(state?.angularVelocity, [(random() - .5) * .4, (random() - .5) * .4, (random() - .5) * .3], 'angularVelocity'));
    if (state?.quaternion) {
      if (state.quaternion.length !== 4 || !state.quaternion.every(Number.isFinite) || Math.hypot(...state.quaternion) < EPSILON) throw new TypeError('Invalid quaternion');
      body.quaternion.set(...state.quaternion);
      body.quaternion.normalize();
    } else {
      body.quaternion.setFromEuler((random() - .5) * .35, (random() - .5) * .6, (random() - .5) * .7);
    }
    body.force.setZero();
    body.torque.setZero();
    body.previousPosition.copy(body.position);
    body.interpolatedPosition.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    body.interpolatedQuaternion.copy(body.quaternion);
    body.aabbNeedsUpdate = true;
    body.wakeUp();
    contactFlags[leaf.index] = 0;
    Object.assign(poses[leaf.index], { contact: false, contactCount: 0, supported: false });
  }

  for (let i = 0; i < count; i += 1) {
    const body = new Body({ mass: .026, material: leafMaterial, allowSleep: false, linearDamping: .06, angularDamping: .65, collisionFilterGroup: LEAF_GROUP, collisionFilterMask: TEXT_GROUP });
    const variation = random();
    const leaf = { body, index: i, variation, phase: random() * Math.PI * 2, scale: 1, supportLane: i < 4, depth: i < 4 ? supportDepth : 2.1 + .6 * variation };
    leaves.push(leaf);
    poses.push({ position: [0, 0, 0], quaternion: [0, 0, 0, 1], velocity: [0, 0, 0], angularVelocity: [0, 0, 0], scale: 1, contact: false, supported: false, contactCount: 0 });
    setScale(leaf, initialStates?.[i]?.scale ?? (bounds.portrait ? .38 + .17 * variation : .7 + .4 * variation));
    placeLeaf(leaf, initialStates?.[i]);
    world.addBody(body);
    leafIndex.set(body.id, i);
  }
  syncPoses();

  function clearText() {
    for (const body of textBodies) world.removeBody(body);
    textBodies.length = 0;
    world.contacts.length = 0;
    world.frictionEquations.length = 0;
    contactCount = 0;
    contactFlags.fill(0);
    for (const pose of poses) { pose.contact = false; pose.contactCount = 0; pose.supported = false; }
  }

  function primeFirstText(boxes) {
    if (didPrime || !boxes.length) return;
    didPrime = true;
    // Only the initial entrance is staged. Select actual exposed upper strokes
    // at four separated X positions; later section changes never teleport a
    // visible leaf onto a new word. All subsequent landings are emergent.
    const upper = [...boxes].sort((a, b) => (b.center[1] + b.halfExtents[1]) - (a.center[1] + a.halfExtents[1]));
    const topY = upper[0].center[1] + upper[0].halfExtents[1];
    const topBand = upper.filter((box) => box.center[1] + box.halfExtents[1] > topY - .55).sort((a, b) => a.center[0] - b.center[0]);
    const candidates = topBand.filter((box, index) => index === 0 || Math.abs(box.center[0] - topBand[index - 1].center[0]) > EPSILON);
    const slots = [.12, .37, .63, .88];
    for (let i = 0; i < Math.min(4, count); i += 1) {
      const leaf = leaves[i];
      if (leaf.body.position.y < bounds.halfHeight + leaf.scale * .5) continue;
      const box = candidates[Math.round((candidates.length - 1) * slots[i])];
      placeLeaf(leaf, { position: [box.center[0], box.center[1] + box.halfExtents[1] + .95 + i * .2, box.center[2]], velocity: [0, -.12, 0], angularVelocity: [.02, -.025, (i - 1.5) * .025], quaternion: [0, 0, 0, 1] });
    }
    syncPoses();
  }

  function setTextColliders(boxes = [], key = null) {
    if (disposed) return false;
    if (key !== null && key === currentKey) return false;
    if (!Array.isArray(boxes) || boxes.length > MAPLE_PHYSICS_LIMITS.textBoxes) throw new RangeError(`At most ${MAPLE_PHYSICS_LIMITS.textBoxes} text boxes are supported`);
    // Validate before replacing the currently valid collider set.
    for (const box of boxes) {
      vector(box.center, null, 'box.center');
      const half = vector(box.halfExtents, null, 'box.halfExtents');
      if (half.some((n) => n <= 0)) throw new RangeError('Box half extents must be positive');
    }
    clearText();
    if (boxes.length) {
      supportDepth = boxes.reduce((sum, box) => sum + box.center[2], 0) / boxes.length;
      for (const leaf of leaves) if (leaf.supportLane) leaf.depth = supportDepth;
    }
    for (const { center, halfExtents } of boxes) {
      const body = new Body({ mass: 0, type: Body.STATIC, material: textMaterial, position: new Vec3(...center), shape: new Box(new Vec3(...halfExtents)), collisionFilterGroup: TEXT_GROUP, collisionFilterMask: LEAF_GROUP });
      textBodies.push(body);
      world.addBody(body);
    }
    world.broadphase.dirty = true;
    currentKey = key;
    textRevision += 1;
    primeFirstText(boxes);
    return true;
  }

  function resize(next) {
    if (disposed) return;
    const width = next.halfWidth;
    const height = next.halfHeight;
    const isPortrait = Boolean(next.portrait);
    if (!(width > 0 && height > 0 && Number.isFinite(width + height))) throw new RangeError('Invalid viewport bounds');
    const portraitChanged = isPortrait !== bounds.portrait;
    bounds = { halfWidth: width, halfHeight: height, portrait: isPortrait };
    if (portraitChanged) {
      for (const leaf of leaves) setScale(leaf, isPortrait ? .38 + .17 * leaf.variation : .7 + .4 * leaf.variation);
    }
    // Prior to simulation/first glyph, fit the offscreen entrance to its actual
    // camera. A later resize does not reset visible bodies or their momentum.
    if (!fixedSteps && !didPrime && !initialStates) {
      for (const leaf of leaves) placeLeaf(leaf);
    }
    world.broadphase.dirty = true;
    syncPoses();
  }

  function readContacts() {
    contactCount = 0;
    for (const pose of poses) { pose.contact = false; pose.contactCount = 0; pose.supported = false; }
    for (const equation of world.contacts) {
      if (!equation.enabled) continue;
      let index = leafIndex.get(equation.bi.id);
      let supportY = -equation.ni.y;
      if (index === undefined) { index = leafIndex.get(equation.bj.id); supportY = equation.ni.y; }
      if (index === undefined) continue;
      const pose = poses[index];
      pose.contact = true;
      pose.contactCount += 1;
      pose.supported ||= supportY > .35;
      contactCount += 1;
    }
    for (let i = 0; i < count; i += 1) {
      if (poses[i].contact && !contactFlags[i]) contactEvents += 1;
      contactFlags[i] = poses[i].contact ? 1 : 0;
    }
    if (contactCount) contactSteps += 1;
  }

  function fixedStep() {
    const time = simulatedTime;
    for (const leaf of leaves) {
      const body = leaf.body;
      capVector(body.velocity, MAPLE_PHYSICS_LIMITS.speed);
      capVector(body.angularVelocity, MAPLE_PHYSICS_LIMITS.angularSpeed);
      body.quaternion.vmult(localNormal, scratchNormal);
      const speed = body.velocity.length();
      const faceDrag = speed > EPSILON ? Math.abs(scratchNormal.dot(body.velocity)) / speed : 0;
      const drag = 1.25 + .9 * faceDrag;
      const phase = leaf.phase;
      // A continuous mild breeze never periodically overpowers gravity. The
      // front stream has a wider crosswind; word-depth leaves can physically
      // lie on the stroke's top surface for a sustained, readable interval.
      // Depth is a soft airflow lane, not a position constraint: all six DOFs
      // remain in Cannon's solver and support disappears with the real boxes.
      const breeze = leaf.supportLane ? .045 : .38;
      const windX = windStrength * breeze * (Math.sin(time * .47 + phase) + .35 * Math.sin(time * 1.2 + phase));
      const windY = windStrength * .045 * Math.sin(time * .63 + phase);
      const windZ = windStrength * .025 * Math.sin(time * .71 + phase);
      scratchForce.set(body.mass * (windX - drag * body.velocity.x), body.mass * (windY - drag * body.velocity.y), body.mass * (windZ - .65 * (body.position.z - leaf.depth) - 1.5 * body.velocity.z));
      body.applyForce(scratchForce);
      const torqueScale = body.mass * leaf.scale * leaf.scale * windStrength;
      const flutter = leaf.supportLane ? .002 : .012;
      scratchTorque.set(torqueScale * flutter * Math.sin(time * 1.4 + phase), torqueScale * flutter * Math.cos(time * .9 + phase), torqueScale * flutter * Math.sin(time * 1.2 + phase));
      body.applyTorque(scratchTorque);
    }
    world.step(MAPLE_PHYSICS_STEP);
    simulatedTime += MAPLE_PHYSICS_STEP;
    fixedSteps += 1;
    readContacts();
    if (recycle) {
      for (const leaf of leaves) {
        const p = leaf.body.position;
        if (p.y < -bounds.halfHeight - 1.5 || Math.abs(p.x) > bounds.halfWidth + 2.5 || Math.abs(p.z) > 5) {
          placeLeaf(leaf);
          recycled += 1;
        }
      }
    }
  }

  function step(delta, _time) {
    if (disposed || paused) return poses;
    if (!(Number.isFinite(delta) && delta >= 0)) throw new RangeError('delta must be a finite nonnegative number');
    const accepted = Math.min(delta, MAPLE_PHYSICS_STEP * MAPLE_PHYSICS_LIMITS.substeps);
    droppedTime += delta - accepted;
    accumulator += accepted;
    let iterations = 0;
    while (accumulator + EPSILON >= MAPLE_PHYSICS_STEP && iterations < MAPLE_PHYSICS_LIMITS.substeps) {
      fixedStep();
      accumulator = Math.max(0, accumulator - MAPLE_PHYSICS_STEP);
      iterations += 1;
    }
    return syncPoses();
  }

  function setPaused(value) {
    if (disposed || paused === Boolean(value)) return;
    paused = Boolean(value);
    accumulator = 0;
  }

  function reset({ states = initialStates, nextSeed = seed } = {}) {
    if (disposed) return poses;
    random = randomGenerator(nextSeed);
    accumulator = 0;
    simulatedTime = 0;
    fixedSteps = 0;
    droppedTime = 0;
    recycled = 0;
    contactCount = 0;
    contactEvents = 0;
    contactSteps = 0;
    world.time = 0;
    world.stepnumber = 0;
    world.contacts.length = 0;
    world.frictionEquations.length = 0;
    for (const leaf of leaves) placeLeaf(leaf, states?.[leaf.index]);
    world.broadphase.dirty = true;
    return syncPoses();
  }

  function getDiagnostics() {
    return {
      engine: 'cannon-es', version: '0.20.0', fixedDt: MAPLE_PHYSICS_STEP,
      leaves: disposed ? 0 : leaves.length, bodies: world.bodies.length,
      textBoxes: textBodies.length, leafShapes: disposed ? 0 : leaves.reduce((sum, leaf) => sum + leaf.body.shapes.length, 0),
      textRevision, contactCount, frictionEquations: world.frictionEquations.length, touchingLeaves: poses.filter((pose) => pose.contact).length,
      supportedLeaves: poses.filter((pose) => pose.supported).length, contactEvents, contactSteps,
      supportLaneLeaves: leaves.filter((leaf) => leaf.supportLane).length,
      fixedSteps, simulatedTime, accumulator, droppedTime, recycled, paused, disposed,
    };
  }

  function dispose() {
    if (disposed) return;
    paused = true;
    clearText();
    for (const leaf of leaves) {
      world.removeBody(leaf.body);
      while (leaf.body.shapes.length) leaf.body.removeShape(leaf.body.shapes[leaf.body.shapes.length - 1]);
    }
    world.removeContactMaterial(contactMaterial);
    world.solver.removeAllEquations();
    world.solver.pairsPerLeaf.clear();
    world.narrowphase.contactPointPool.length = 0;
    world.narrowphase.frictionEquationPool.length = 0;
    leafIndex.clear();
    world.contacts.length = 0;
    world.frictionEquations.length = 0;
    accumulator = 0;
    disposed = true;
  }

  return { setTextColliders, resize, step, reset, setPaused, dispose, getDiagnostics, setWindStrength(value) {
    if (!(Number.isFinite(value) && value >= 0)) throw new RangeError('Invalid wind strength');
    windStrength = value;
  } };
}
