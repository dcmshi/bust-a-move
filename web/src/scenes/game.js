/**
 * scenes/game.js
 * Main game scene coordinator.
 *
 * Ties together: grid, levels, bubble physics, colour matching, ball drop,
 * renderer, input, and audio into the main game loop.
 *
 * Scene states (internal):
 *   'idle'    – shooter visible, player adjusts angle and fires
 *   'flying'  – active bubble travelling across the screen
 *   'landing' – one-frame processing step (snap → pop → drop → redraw)
 *
 * Scene interface (consumed by main.js):
 *   enter()              called once when switching to this scene
 *   update() → string    returns next scene key, or null to stay
 *   render(ctx)
 */

import { keys }                                from '../input.js';
import * as audio                              from '../audio.js';
import { createGrid, snapToGrid, ROWS, COLS } from '../game/grid.js';
import { fillLevel, trackForLevel, LEVEL_COUNT } from '../game/levels.js';
import {
  createBubble,
  moveBubble,
  applyWallBounce,
  isCeiling,
  isNearBubble,
} from '../game/bubble.js';
import { checkAndPop }      from '../game/colourCheck.js';
import { dropDisconnected } from '../game/ballDrop.js';
import {
  createBubbleCanvas,
  redrawBubbleCanvas,
  drawGameScene,
} from '../game/renderer.js';

// ── Game state ────────────────────────────────────────────────────────────────

let grid           = null;    // number[][] — grid[row][col]
let bc             = null;    // HTMLCanvasElement — offscreen bubble cache
let level          = 1;
let lives          = 3;
let ang            = 90;      // shooter angle; 90 = straight up
let state          = 'idle';  // 'idle' | 'flying' | 'landing'
let activeBubble   = null;    // { x, y, colorId, vx, vy } | null
let currentColorId = 0;       // colour of the bubble loaded in the shooter
let nextColorId    = 0;       // colour of the preview bubble
let spaceWasDown   = false;   // one-shot space detection (fire on first press only)

// ── Helpers ───────────────────────────────────────────────────────────────────

function randColorId() {
  return Math.floor(Math.random() * 8) + 1;  // 1–8
}

/** Start a fresh level (or the next one). Resets per-level state. */
function loadLevel() {
  fillLevel(level, grid);
  redrawBubbleCanvas(bc, grid);
  audio.stop();
  audio.playLoop(trackForLevel(level));
}

/** Check whether any cell in the last row (row 11) is occupied. */
function hasBubbleInLastRow() {
  const lastRow = ROWS - 1; // row 11
  for (let col = 0; col < COLS; col++) {
    if (grid[lastRow][col]) return true;
  }
  return false;
}

/** Check whether the grid is completely empty. */
function isGridEmpty() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col]) return false;
    }
  }
  return true;
}

// ── Scene interface ───────────────────────────────────────────────────────────

/**
 * Called by main.js when entering this scene (from intro or after game-over).
 * Resets everything and starts at level 1.
 */
export function enter() {
  grid           = createGrid();
  bc             = createBubbleCanvas();
  level          = 1;
  lives          = 3;
  ang            = 90;
  state          = 'idle';
  activeBubble   = null;
  spaceWasDown   = false;
  currentColorId = randColorId();
  nextColorId    = randColorId();
  loadLevel();
}

/**
 * Process one frame of game logic.
 * @returns {string|null}  Scene key for transition, or null to stay.
 */
export function update() {
  // ── Angle control (always active) ──────────────────────────────────────────
  if (state !== 'flying') {
    if (keys.has('ArrowLeft'))  ang = Math.min(ang + 1, 150);
    if (keys.has('ArrowRight')) ang = Math.max(ang - 1, 30);
  }

  // ── Fire (one-shot — fire only on the first frame space is pressed) ─────────
  const spaceDown = keys.has(' ');
  if (state === 'idle' && spaceDown && !spaceWasDown) {
    activeBubble = createBubble(ang, currentColorId);
    state        = 'flying';
  }
  spaceWasDown = spaceDown;

  // ── Move ────────────────────────────────────────────────────────────────────
  if (state === 'flying') {
    moveBubble(activeBubble);
    applyWallBounce(activeBubble);

    const shouldLand = isCeiling(activeBubble) || isNearBubble(activeBubble, grid);
    if (shouldLand) {
      state = 'landing';
    }
  }

  // ── Land (one-frame processing) ─────────────────────────────────────────────
  if (state === 'landing') {
    // 1. Snap to nearest empty cell
    const { col, row } = snapToGrid(activeBubble.x, activeBubble.y, grid);
    grid[row][col] = activeBubble.colorId;

    // 2. Check for colour match and pop (BFS)
    checkAndPop(grid, col, row);

    // 3. Remove disconnected bubbles
    dropDisconnected(grid);

    // 4. Refresh the offscreen bubble canvas
    redrawBubbleCanvas(bc, grid);

    // 5. Clear the active bubble before checking game state
    activeBubble   = null;
    currentColorId = nextColorId;
    nextColorId    = randColorId();
    state          = 'idle';

    // 6. Check: did any bubble reach the last row? (checked AFTER popping)
    if (hasBubbleInLastRow()) {
      if (lives > 1) {
        lives -= 1;
        loadLevel();          // restart current level with one fewer life
      } else {
        return 'gameover-lose';
      }
    }
    // 7. Check: is the level cleared?
    else if (isGridEmpty()) {
      level += 1;
      if (level > LEVEL_COUNT) {
        return 'gameover-win';
      }
      loadLevel();            // advance to next level
      currentColorId = randColorId();
      nextColorId    = randColorId();
    }
  }

  return null;
}

/**
 * Render the current game frame.
 * @param {CanvasRenderingContext2D} ctx
 */
export function render(ctx) {
  drawGameScene(ctx, bc, level, ang, activeBubble, nextColorId, lives);
}
