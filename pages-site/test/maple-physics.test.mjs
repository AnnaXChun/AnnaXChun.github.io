import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import { createMaplePhysics, MAPLE_PHYSICS_LIMITS, MAPLE_PHYSICS_STEP } from '../src/MaplePhysics.js';

const stroke = { center: [0, 0, 0], halfExtents: [.5, .025, .35] };
const initial = (position = [0, 1.5, 0], overrides = {}) => ({ position, quaternion: [0, 0, 0, 1], velocity: [0, 0, 0], angularVelocity: [0, 0, 0], scale: 1, ...overrides });
const run = (simulation, seconds, hz = 60) => {
  let poses;
  for (let frame = 0; frame < Math.round(seconds * hz); frame += 1) poses = simulation.step(1 / hz, frame / hz);
  return poses;
};
const snapshot = (simulation) => structuredClone(simulation.step(0));

test('a curled rigid leaf falls, lies flat and remains physically supported for 30 seconds in a gentle breeze', () => {
  const simulation = createMaplePhysics({ count: 1, recycle: false, initialStates: [initial()] });
  try {
    simulation.setTextColliders([stroke], 'stroke');
    const poses = run(simulation, 5);
    assert.equal(poses[0].supported, true, 'support comes from a Cannon contact normal');
    assert.ok(poses[0].contactCount > 0);
    assert.ok(Math.hypot(...poses[0].velocity) < .02, 'gravity and contact settle without a pose lock');
    const [qx, qy, qz, qw] = poses[0].quaternion;
    assert.ok(Math.abs(2 * (qy * qz - qw * qx)) > .9, 'the broad leaf face lies approximately horizontal');
    const rest = snapshot(simulation)[0];
    for (let frame = 0; frame < 30 * 60; frame += 1) {
      const pose = simulation.step(MAPLE_PHYSICS_STEP)[0];
      assert.equal(pose.supported, true, 'the leaf stays on actual contact throughout the dwell');
      assert.ok(Math.hypot(...pose.position.map((value, i) => value - rest.position[i])) < .015, 'gentle wind does not carry the resting subject away');
      assert.ok(Math.hypot(...pose.velocity) < .02);
    }
    assert.ok(simulation.getDiagnostics().contactSteps > 30 * 60);
  } finally { simulation.dispose(); }
});

test('letter whitespace remains open while the neighboring stroke supports another leaf', () => {
  const simulation = createMaplePhysics({ count: 2, windStrength: 0, recycle: false, initialStates: [initial([0, 1.5, 0]), initial([-1.3, 1.5, 0])] });
  try {
    simulation.setTextColliders([
      { center: [-1.3, 0, 0], halfExtents: [.4, .025, .35] },
      { center: [1.3, 0, 0], halfExtents: [.4, .025, .35] },
    ], 'two-strokes');
    let gapContacts = 0;
    for (let frame = 0; frame < 240; frame += 1) gapContacts += simulation.step(MAPLE_PHYSICS_STEP)[0].contactCount;
    const poses = simulation.step(0);
    assert.equal(gapContacts, 0, 'there is no full-line invisible catch plane');
    assert.ok(poses[0].position[1] < -3);
    assert.equal(poses[1].supported, true);
    assert.ok(poses[1].position[1] > -.2);
  } finally { simulation.dispose(); }
});

test('subdividing a stroke preserves stable support without multiplying its friction budget', () => {
  for (const segments of [1, 8, 16]) {
    const simulation = createMaplePhysics({ count: 1, recycle: false, initialStates: [initial()] });
    try {
      simulation.setTextColliders(Array.from({ length: segments }, (_, i) => ({ center: [-.5 + (i + .5) / segments, 0, 0], halfExtents: [.5 / segments, .025, .35] })), `segments-${segments}`);
      run(simulation, 5);
      const rest = snapshot(simulation)[0];
      assert.equal(rest.supported, true);
      run(simulation, 30);
      const pose = simulation.step(0)[0];
      assert.equal(pose.supported, true, `${segments} collider pieces must support the same quiet dwell`);
      assert.ok(Math.hypot(...pose.position.map((value, i) => value - rest.position[i])) < .02);
      simulation.setTextColliders([], 'removed');
      run(simulation, 1);
      assert.ok(pose.position[1] < rest.position[1] - .5, 'there is no contact-age lock after the supporting mesh disappears');
    } finally { simulation.dispose(); }
  }
});

test('actual Chrome Chinese glyphs keep a few stable resting leaves while the foreground stream stays airborne', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/name-glyph-colliders.json', import.meta.url), 'utf8'));
  const halfHeight = 13 * Math.tan(17.5 * Math.PI / 180);
  const simulation = createMaplePhysics({ halfHeight, halfWidth: halfHeight * fixture.viewport[0] / fixture.viewport[1] });
  try {
    simulation.setTextColliders(fixture.boxes, 'actual-name');
    let firstContacts = 0;
    let maximumSupported = 0;
    let rest = null;
    const stable = new Set();
    for (let frame = 0; frame < 120 * 60; frame += 1) {
      const poses = simulation.step(MAPLE_PHYSICS_STEP);
      const supported = poses.filter((pose) => pose.supported).length;
      if (frame < 5 * 60) firstContacts = Math.max(firstContacts, supported);
      maximumSupported = Math.max(maximumSupported, supported);
      for (const pose of poses.slice(4)) {
        assert.equal(pose.contact, false, 'foreground falling leaves pass in front of the real word, without special collision masks');
        assert.ok(pose.position[2] > 1.5);
      }
      if (frame === 10 * 60) {
        rest = snapshot(simulation);
        rest.slice(0, 4).forEach((pose, index) => { if (pose.supported) stable.add(index); });
      }
      if (frame > 10 * 60 && frame <= 40 * 60) {
        for (const index of stable) {
          const pose = poses[index];
          if (!pose.supported || Math.hypot(...pose.position.map((value, axis) => value - rest[index].position[axis])) > .025) stable.delete(index);
        }
      }
    }
    assert.ok(firstContacts >= 3, 'actual strokes visibly catch several leaves during the entrance');
    assert.ok(stable.size >= 2, 'at least two real-glyph subjects retain support and position for an uninterrupted 30 seconds');
    assert.ok(maximumSupported <= 4, 'two-minute dwell never accumulates all 18 leaves on the name');
    const diagnostics = simulation.getDiagnostics();
    assert.ok(diagnostics.supportedLeaves >= 3 && diagnostics.supportedLeaves <= 4);
    assert.ok(diagnostics.recycled > 80, 'the other leaves naturally leave the frame and keep circulating');
    assert.equal(diagnostics.textRevision, 1, 'resting is not manufactured by replacing the collision bodies');
    assert.equal(diagnostics.bodies, fixture.boxes.length + 18);
    assert.equal(diagnostics.supportLaneLeaves, 4);
    const beforeRemoval = snapshot(simulation);
    simulation.setTextColliders([], 'no-word');
    assert.deepEqual(snapshot(simulation).map((pose) => pose.position), beforeRemoval.map((pose) => pose.position));
    run(simulation, 1);
    for (const index of stable) {
      assert.equal(simulation.step(0)[index].supported, false);
      assert.ok(simulation.step(0)[index].position[1] < beforeRemoval[index].position[1] - .5, 'removing text releases the real resting bodies to gravity');
    }
  } finally { simulation.dispose(); }
});

test('fixed-step speed budget prevents tunneling through a .05-unit stroke, including edge-on falls', () => {
  for (const pitch of [0, Math.PI / 2, -Math.PI / 2]) {
    const simulation = createMaplePhysics({ count: 1, windStrength: 0, recycle: false, initialStates: [initial([0, .8, 0], { quaternion: [Math.sin(pitch / 2), 0, 0, Math.cos(pitch / 2)], velocity: [0, -200, 0] })] });
    try {
      simulation.setTextColliders([stroke], 'thin');
      simulation.step(5); // A long render stall is bounded; it is not five seconds of catch-up.
      assert.equal(simulation.getDiagnostics().fixedSteps, MAPLE_PHYSICS_LIMITS.substeps);
      assert.ok(simulation.getDiagnostics().droppedTime > 4.8);
      let touched = false;
      let minimumY = Infinity;
      for (let frame = 0; frame < 180; frame += 1) {
        const pose = simulation.step(MAPLE_PHYSICS_STEP)[0];
        touched ||= pose.contact;
        minimumY = Math.min(minimumY, pose.position[1]);
        assert.ok([...pose.position, ...pose.quaternion, ...pose.velocity].every(Number.isFinite));
      }
      assert.equal(touched, true, `pitch ${pitch} must actually collide`);
      assert.ok(minimumY > -.22, `pitch ${pitch} must not pass through the support: ${minimumY}`);
    } finally { simulation.dispose(); }
  }
});

test('30, 60 and 120 Hz callers produce the same fixed-step trajectory and pause accrues no time', () => {
  const simulations = [30, 60, 120].map(() => createMaplePhysics({ count: 2, recycle: false, seed: 17, initialStates: [initial(), initial([2, 2, .15])] }));
  try {
    for (let i = 0; i < simulations.length; i += 1) {
      simulations[i].setTextColliders([stroke], 'stroke');
      run(simulations[i], 8, [30, 60, 120][i]);
      assert.equal(simulations[i].getDiagnostics().fixedSteps, 480);
    }
    const expected = snapshot(simulations[0]);
    for (const simulation of simulations.slice(1)) assert.deepEqual(snapshot(simulation), expected);
    const simulation = simulations[0];
    const stepsBefore = simulation.getDiagnostics().fixedSteps;
    simulation.step(1 / 120);
    simulation.setPaused(true);
    const pausedPose = snapshot(simulation);
    simulation.step(3600, 3600);
    assert.deepEqual(snapshot(simulation), pausedPose);
    assert.equal(simulation.getDiagnostics().fixedSteps, stepsBefore);
    assert.equal(simulation.getDiagnostics().accumulator, 0);
    simulation.setPaused(false);
    simulation.step(1 / 120, 3600);
    assert.equal(simulation.getDiagnostics().fixedSteps, stepsBefore, 'hidden/fractional time is not accumulated');
    simulation.setPaused(false); // An idempotent scene update must not discard the live remainder.
    simulation.step(1 / 120, 3600);
    assert.equal(simulation.getDiagnostics().fixedSteps, stepsBefore + 1);
  } finally { simulations.forEach((simulation) => simulation.dispose()); }
});

test('removing a word removes support; section changes never pin or teleport a visible leaf', () => {
  const simulation = createMaplePhysics({ count: 1, windStrength: 0, recycle: false, initialStates: [initial()] });
  try {
    simulation.setTextColliders([stroke], 'first');
    run(simulation, 4);
    const before = snapshot(simulation)[0];
    simulation.setTextColliders([], 'transition');
    assert.deepEqual(snapshot(simulation)[0].position, before.position);
    run(simulation, 1);
    assert.ok(simulation.step(0)[0].position[1] < before.position[1] - .5);
    const after = snapshot(simulation)[0];
    simulation.setTextColliders([{ center: [2, 2, 0], halfExtents: [.5, .025, .35] }], 'next');
    assert.deepEqual(snapshot(simulation)[0].position, after.position);
    assert.deepEqual(snapshot(simulation)[0].velocity, after.velocity);
  } finally { simulation.dispose(); }
});

test('initial actual-stroke staging, keyed rebuilds, resize, recycling and disposal keep resources bounded', () => {
  const simulation = createMaplePhysics({ count: 18, seed: 31 });
  try {
    simulation.resize({ halfWidth: 3, halfHeight: 5, portrait: true });
    const boxes = Array.from({ length: 512 }, (_, i) => ({ center: [(i % 32) * .18 - 2.8, 2 - Math.floor(i / 32) * .12, 0], halfExtents: [.05, .025, .35] }));
    simulation.setTextColliders(boxes, 'first');
    const poses = simulation.step(0);
    assert.ok(poses.every((pose) => pose.scale >= .38 && pose.scale <= .55));
    assert.ok(poses.slice(0, 4).every((pose) => pose.position[1] > 2.8 && pose.position[1] < 3.7));
    const firstPoses = poses;
    const firstPositionArray = poses[0].position;
    const revision = simulation.getDiagnostics().textRevision;
    assert.equal(simulation.setTextColliders(boxes, 'first'), false);
    assert.equal(simulation.getDiagnostics().textRevision, revision);
    for (let i = 0; i < 12; i += 1) {
      simulation.setTextColliders(boxes.slice(0, i % 2 ? 20 : 512), `revision-${i}`);
      const diagnostics = simulation.getDiagnostics();
      assert.equal(diagnostics.bodies, 18 + (i % 2 ? 20 : 512));
      assert.equal(diagnostics.leafShapes, 90);
    }
    simulation.setTextColliders([], 'empty');
    run(simulation, 25, 30);
    assert.ok(simulation.getDiagnostics().recycled > 0);
    assert.equal(simulation.getDiagnostics().bodies, 18);
    assert.equal(simulation.step(0), firstPoses, 'pose list is reused');
    assert.equal(simulation.step(0)[0].position, firstPositionArray, 'pose vectors are reused');
    simulation.resize({ halfWidth: 8, halfHeight: 5, portrait: false });
    assert.ok(poses.every((pose) => pose.scale >= .7 && pose.scale <= 1.1));
    assert.equal(simulation.getDiagnostics().leafShapes, 90);
    assert.throws(() => simulation.setTextColliders(Array.from({ length: 769 }, () => stroke), 'too-many'), /At most 768/);
    assert.throws(() => simulation.setTextColliders([{ center: [0, NaN, 0], halfExtents: [1, 1, 1] }], 'bad'), /finite/);
    simulation.dispose();
    simulation.dispose();
    const final = simulation.getDiagnostics();
    assert.equal(final.bodies, 0);
    assert.equal(final.leafShapes, 0);
    assert.equal(final.textBoxes, 0);
    assert.equal(final.contactCount, 0);
    assert.equal(final.disposed, true);
  } finally { simulation.dispose(); }
});
