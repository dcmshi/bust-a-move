/**
 * game/bubble.js
 * Active-bubble physics: spawn, velocity, movement, wall bounce, landing detection.
 *
 * The active bubble is stored as its canvas-space centre { x, y, colorId, vx, vy }.
 *
 * Turing coordinate origins (verified against source):
 *   Spawn:    spots.x = 302 (left edge), spots.y = 39 (bottom edge)
 *             → canvas centre: cx = 302+16 = 318,  cy = 450-39-16 = 395
 *
 *   Wall L:   spots.x <= maxx-450 = 190  →  cx <= 206
 *   Wall R:   spots.x >= maxx-220 = 420  →  cx >= 436
 *   Ceiling:  spots.y >= maxy-80  = 370  →  cy <= 64
 *
 *   Velocity: vx = cosd(ang)*6,  vy = sind(ang)*6  (Turing y-up)
 *             In canvas (y-down): vy_canvas = -vy_turing
 *
 *   Proximity: Math.Distance(spots.x+16, spots.y+16, cellCx, cellCy) <= 35
 *              which is the same as canvas centre-to-centre distance
 */

import { CELL_CENTERS, ROWS, COLS } from './grid.js';

// ── Constants ─────────────────────────────────────────────────────────────────

export const SPAWN_X   = 318;   // canvas centre X at spawn
export const SPAWN_Y   = 395;   // canvas centre Y at spawn
export const SPEED     = 6;     // px per frame (fixed, matches original)
export const WALL_LEFT = 206;   // cx <= this  → reverse vx (left wall)
export const WALL_RIGHT= 436;   // cx >= this  → reverse vx (right wall)
export const CEILING_Y = 64;    // cy <= this  → bubble has hit the ceiling
export const NEAR_DIST = 35;    // px  → close enough to a filled cell to snap

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a new active bubble ready to be fired.
 * @param {number} ang      Shooter angle in degrees (30–150; 90 = straight up).
 * @param {number} colorId  Colour ID (1–8).
 * @returns {{ x, y, colorId, vx, vy }}
 */
export function createBubble(ang, colorId) {
  // Turing: vx = cosd(ang)*6,  vy = sind(ang)*6  (y-up)
  // Canvas: flip vy sign because y increases downward
  const rad = ang * Math.PI / 180;
  return {
    x:       SPAWN_X,
    y:       SPAWN_Y,
    colorId,
    vx:  Math.cos(rad) * SPEED,
    vy: -Math.sin(rad) * SPEED,
  };
}

// ── Per-frame update ──────────────────────────────────────────────────────────

/**
 * Advance the bubble by one frame (add velocity).
 * @param {{ x, y, vx, vy }} bubble  Mutated in place.
 */
export function moveBubble(bubble) {
  bubble.x += bubble.vx;
  bubble.y += bubble.vy;
}

/**
 * Reverse vx if the bubble has crossed a side wall.
 * Matches Turing's `wall` proc: `vx *= -1`.
 * @param {{ x, vx }} bubble  Mutated in place.
 */
export function applyWallBounce(bubble) {
  if (bubble.x <= WALL_LEFT || bubble.x >= WALL_RIGHT) {
    bubble.vx = -bubble.vx;
  }
}

// ── Landing checks ────────────────────────────────────────────────────────────

/**
 * Returns true when the bubble has reached the ceiling row.
 * Matches Turing: `spots.y >= maxy - 80` (→ cy <= 64 in canvas space).
 * @param {{ y }} bubble
 */
export function isCeiling(bubble) {
  return bubble.y <= CEILING_Y;
}

/**
 * Returns true when the bubble's centre is within NEAR_DIST of any occupied cell.
 * Matches Turing's `ballDistance` proc.
 * @param {{ x, y }} bubble
 * @param {number[][]} grid   grid[row][col], 0 = empty.
 */
export function isNearBubble(bubble, grid) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!grid[row][col]) continue;
      const center = CELL_CENTERS[row][col];
      if (!center) continue;
      if (Math.hypot(bubble.x - center.x, bubble.y - center.y) <= NEAR_DIST) {
        return true;
      }
    }
  }
  return false;
}
