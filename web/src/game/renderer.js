/**
 * renderer.js
 * All canvas drawing logic. No game state is modified here.
 *
 * Coordinate system:
 *   Turing uses bottom-left origin (y=0 at bottom, increases upward).
 *   Canvas uses top-left origin  (y=0 at top,    increases downward).
 *
 *   Converting Turing bottom-left draw position (tx, ty) to canvas top-left:
 *     canvasX = tx
 *     canvasY = 450 - ty - img.height
 *
 *   Converting a Turing hit-test region [x1..x2, y1..y2] to a canvas rect:
 *     { x: x1, y: 450 - y2, w: x2 - x1, h: y2 - y1 }
 *
 * NOTE: Bubble/sprite images are BMP (no alpha channel). Until they are
 * converted to PNG with transparency, picMerge-style compositing won't work
 * and bubble sprites will have rectangular black backgrounds. Converting to
 * PNG with a transparent black background is the recommended fix.
 */

import { images, getBubbleImage, getBackground } from '../assets.js';
import { CELL_CENTERS, ROWS, COLS, BUBBLE_SIZE } from './grid.js';

export const W = 640;
export const H = 450;

// Shorthand: Turing bottom-left → canvas top-left Y for a given image height.
const tY = (ty, imgH) => H - ty - imgH;

// ── Bubble offscreen canvas ───────────────────────────────────────────────────

/**
 * Create a full-size offscreen canvas used as the bubble layer cache.
 * Transparent by default; composited over the background each frame.
 */
export function createBubbleCanvas() {
  const bc    = document.createElement('canvas');
  bc.width    = W;
  bc.height   = H;
  return bc;
}

/**
 * Clear and redraw every bubble currently in the grid onto the offscreen canvas.
 * Call this after any bubble lands, pops, or drops.
 * @param {HTMLCanvasElement} bc   The offscreen bubble canvas.
 * @param {number[][]}        grid grid[row][col], 0 = empty.
 */
export function redrawBubbleCanvas(bc, grid) {
  const ctx = bc.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const color = grid[row][col];
      if (!color) continue;
      const center = CELL_CENTERS[row][col];
      if (!center) continue;
      ctx.drawImage(getBubbleImage(color), center.x - 16, center.y - 16);
    }
  }
}

// ── Game scene ────────────────────────────────────────────────────────────────

/** Draw the level background image. */
export function drawBackground(ctx, level) {
  ctx.drawImage(getBackground(level), 0, 0);
}

/** Blit the offscreen bubble canvas onto the main canvas. */
export function drawBubbleCacheLayer(ctx, bc) {
  ctx.drawImage(bc, 0, 0);
}

/**
 * Draw all HUD elements: gun base, "next" label, preview bubble, man, lives.
 *
 * Turing source positions (bottom-left):
 *   gun:     (maxx/2 - 64, 0)   = (255, 0)
 *   next:    (225, 35)
 *   preview: (maxx/2 - 60, 0)   = (259, 0)
 *   man:     (370, 0)
 *   life:    (507, 415 or 416)
 *
 * @param {number} nextColorId  Colour ID (1–8) of the queued-up bubble.
 * @param {number} lives        Remaining lives (1–3).
 */
export function drawHUD(ctx, nextColorId, lives) {
  const { gun, next, man, life1, life2, life3 } = images;

  // Gun base
  ctx.drawImage(gun,  255, tY(0, gun.height));

  // "NEXT" label
  ctx.drawImage(next, 225, tY(35, next.height));

  // Preview bubble (the one queued after the current shot)
  ctx.drawImage(getBubbleImage(nextColorId), 259, tY(0, BUBBLE_SIZE));

  // Man decoration
  ctx.drawImage(man, 370, tY(0, man.height));

  // Lives indicator (Turing life3 is at y=415, life2/1 at y=416 — 1px difference
  // in the original; we normalise to y=415 for all)
  const lifeImg = lives >= 3 ? life3 : lives === 2 ? life2 : life1;
  ctx.drawImage(lifeImg, 507, tY(415, lifeImg.height));
}

/**
 * Draw the rotating shooter cannon.
 *
 * Turing: Pic.Rotate(shooterPic, k-90, cx=63, cy=59)
 *   cx=63 is 63px from the left of the image.
 *   cy=59 is 59px from the BOTTOM of the image → from top: img.height - 59.
 *
 * Placed at Turing bottom-left (maxx/2 - 65, 0) = (254, 0).
 *
 * Rotation: Turing Pic.Rotate uses CCW-positive (standard math). In Turing's
 * y-up space, rotating by (ang-90)° CCW looks the same as rotating by
 * (ang-90)° CW in canvas y-down space — HOWEVER, canvas ctx.rotate uses
 * CW-positive, so the sign must be flipped: use (90-ang) not (ang-90).
 *
 *   ang=90  → 0°    → no rotation  → straight up       ✓
 *   ang=30  → +60°  → CW 60°       → points upper-right ✓ (vx > 0)
 *   ang=150 → -60°  → CCW 60°      → points upper-left  ✓ (vx < 0)
 *
 * @param {number} ang  Current cannon angle in degrees (30–150, 90 = straight up).
 */
export function drawShooter(ctx, ang) {
  const img = images.shooter;

  // Pivot within the image in canvas space (y from top)
  const pivotInImgX = 63;
  const pivotInImgY = img.height - 59;

  // Where the image's top-left would appear on the main canvas (unrotated)
  const drawX = 254;
  const drawY = tY(0, img.height);          // = 450 - img.height

  // Pivot on the main canvas
  const pivotX = drawX + pivotInImgX;       // ≈ 317
  const pivotY = drawY + pivotInImgY;       // ≈ 450 - 59 = 391

  const radians = (90 - ang) * Math.PI / 180;

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(radians);
  ctx.drawImage(img, -pivotInImgX, -pivotInImgY);
  ctx.restore();
}

/**
 * Draw the currently flying bubble.
 * @param {number} cx       Bubble centre X in canvas space.
 * @param {number} cy       Bubble centre Y in canvas space.
 * @param {number} colorId  Colour ID (1–8).
 */
export function drawActiveBubble(ctx, cx, cy, colorId) {
  ctx.drawImage(getBubbleImage(colorId), cx - BUBBLE_SIZE / 2, cy - BUBBLE_SIZE / 2);
}

/**
 * Composite the full game frame. Draw order matches the original Turing loop:
 * background → bubble cache → HUD → shooter → active bubble.
 *
 * @param {{ x, y, colorId } | null} activeBubble  null when no shot is in flight.
 */
export function drawGameScene(ctx, bc, level, ang, activeBubble, nextColorId, lives) {
  drawBackground(ctx, level);
  drawBubbleCacheLayer(ctx, bc);
  drawHUD(ctx, nextColorId, lives);
  drawShooter(ctx, ang);
  if (activeBubble) {
    drawActiveBubble(ctx, activeBubble.x, activeBubble.y, activeBubble.colorId);
  }
}

// ── Intro screen ──────────────────────────────────────────────────────────────

// Canvas-space hit regions (converted from Turing mouse-check coordinates).
// Turing region [x1..x2, y1..y2] → canvas { x: x1, y: 450-y2, w: x2-x1, h: y2-y1 }
export const BTN_PLAY  = { x:  12, y: 450 - 246, w: 161, h:  81 };  // Turing x 12-173, y 165-246
export const BTN_INSTR = { x: 484, y: 450 - 253, w: 145, h:  82 };  // Turing x 484-629, y 171-253
export const BTN_BACK  = { x: 240, y: 450 -  40, w: 182, h:  32 };  // Turing x 240-422, y 8-40

/**
 * @param {'play' | 'instructions' | null} hover  Which button is hovered.
 */
export function drawIntroScreen(ctx, hover) {
  // Background fill — approximation of Turing palette colour 58 (steel blue)
  ctx.fillStyle = '#3a5a8a';
  ctx.fillRect(0, 0, W, H);

  // Title: Turing (maxx/2-148, maxy/2-152) = (171, 72)
  const { mainTitle, play, what } = images;
  ctx.drawImage(mainTitle, 171, tY(72, mainTitle.height));

  // Play button image: Turing (15, 180)
  ctx.drawImage(play, 15, tY(180, play.height));

  // Instructions ("what") button image: Turing (483, 178)
  ctx.drawImage(what, 483, tY(178, what.height));

  // Hover outlines — triple border, each offset 1px outward (matches original drawbox calls)
  // Play:  drawbox(12,173,161,246) | drawbox(11,172,162,247) | drawbox(10,171,163,248)
  // Instr: drawbox(481,171,629,246) | etc.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 1;
  if (hover === 'play') {
    _tripleStroke(ctx, 12, 450 - 246, 149, 73);
  } else if (hover === 'instructions') {
    _tripleStroke(ctx, 481, 450 - 246, 148, 75);
  }
}

export function drawInstructionsScreen(ctx, hover) {
  ctx.fillStyle = 'yellow';
  ctx.fillRect(0, 0, W, H);

  const { back, instructions } = images;
  // Back button: Turing (240, 5)
  ctx.drawImage(back, 240, tY(5, back.height));
  // Instructions image: Turing (16, 50)
  ctx.drawImage(instructions, 16, tY(50, instructions.height));

  // Hover outline: drawbox(240,8,422,40)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 1;
  if (hover === 'back') {
    _tripleStroke(ctx, 240, 450 - 40, 182, 32);
  }
}

// ── Game over / win screens ───────────────────────────────────────────────────

export function drawGameOverScreen(ctx, won) {
  // These images are full-screen (640×450) so no coordinate conversion needed.
  ctx.drawImage(won ? images.gameover2 : images.gameover, 0, 0);
}

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Draw three concentric strokeRects, each 1px larger on all sides.
 * Replicates the triple drawbox hover effect from the original.
 */
function _tripleStroke(ctx, x, y, w, h) {
  for (let i = 0; i < 3; i++) {
    ctx.strokeRect(x - i, y - i, w + i * 2, h + i * 2);
  }
}
