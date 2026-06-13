import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createGrid } from '../web/src/game/grid.js';
import {
  createBubble,
  moveBubble,
  applyWallBounce,
  isCeiling,
  isNearBubble,
  SPAWN_X,
  SPAWN_Y,
  SPEED,
  CEILING_Y,
} from '../web/src/game/bubble.js';

test('createBubble fires straight up at angle 90', () => {
  const b = createBubble(90, 3);
  assert.equal(b.x, SPAWN_X);
  assert.equal(b.y, SPAWN_Y);
  assert.equal(b.colorId, 3);
  assert.ok(Math.abs(b.vx) < 1e-9);      // no horizontal component
  assert.ok(Math.abs(b.vy + SPEED) < 1e-9); // moving up (negative canvas-y) at full speed
});

test('moveBubble advances by velocity × dt', () => {
  const b = { x: 0, y: 0, vx: 100, vy: -50 };
  moveBubble(b, 0.5);
  assert.equal(b.x, 50);
  assert.equal(b.y, -25);
});

test('applyWallBounce reverses only when heading into a wall', () => {
  const left = { x: 200, vx: -100 };
  applyWallBounce(left);
  assert.equal(left.vx, 100); // bounced off the left wall

  const right = { x: 440, vx: 100 };
  applyWallBounce(right);
  assert.equal(right.vx, -100); // bounced off the right wall
});

test('applyWallBounce does NOT flip a bubble already moving away (sticky-wall fix)', () => {
  const escaping = { x: 200, vx: 100 }; // past the wall but heading inward
  applyWallBounce(escaping);
  assert.equal(escaping.vx, 100); // unchanged — no re-bounce
});

test('isCeiling triggers at/above the ceiling line', () => {
  assert.equal(isCeiling({ y: CEILING_Y }), true);
  assert.equal(isCeiling({ y: CEILING_Y - 1 }), true);
  assert.equal(isCeiling({ y: CEILING_Y + 1 }), false);
});

test('isNearBubble detects proximity to an occupied cell', () => {
  const grid = createGrid();
  grid[0][0] = 1; // centre at (206, 61)
  assert.equal(isNearBubble({ x: 206, y: 61 }, grid), true);
  assert.equal(isNearBubble({ x: 500, y: 400 }, grid), false);
});
