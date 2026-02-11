/**
 * scenes/intro.js
 * Intro screen (main menu) and instructions sub-screen.
 *
 * Turing had two nested blocking loops for these screens.
 * Here they are two sub-states within a single scene object.
 *
 * Exports the standard scene interface used by main.js:
 *   enter()           → called once when the scene becomes active
 *   update() → string | null  → returns next scene key, or null to stay
 *   render(ctx)       → draw the current frame
 */

import { mouse }                              from '../input.js';
import * as audio                             from '../audio.js';
import {
  drawIntroScreen,
  drawInstructionsScreen,
  BTN_PLAY,
  BTN_INSTR,
  BTN_BACK,
} from '../game/renderer.js';

// ── Internal state ────────────────────────────────────────────────────────────

/** Which sub-screen is visible. */
let screen = 'intro'; // 'intro' | 'instructions'

/** Which button is currently hovered (drives the outline highlight). */
let hover = null; // 'play' | 'instructions' | 'back' | null

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Canvas-space rectangle hit test.
 * @param {{ x, y, w, h }} btn
 * @param {number} mx  Mouse X in canvas space.
 * @param {number} my  Mouse Y in canvas space.
 */
function hitTest(btn, mx, my) {
  return mx >= btn.x && mx < btn.x + btn.w &&
         my >= btn.y && my < btn.y + btn.h;
}

// ── Scene interface ───────────────────────────────────────────────────────────

/**
 * Called by main.js when switching to this scene.
 * Resets to the main menu and starts intro music.
 *
 * NOTE: Browsers block audio until a user gesture has occurred.
 * audio.playLoop() handles the autoplay-policy gracefully — it will
 * attempt to play and silently retry on the first user interaction if blocked.
 */
export function enter() {
  screen = 'intro';
  hover  = null;
  audio.playLoop('intro');
}

/**
 * Process one frame of input logic.
 *
 * Uses mouse.clicked (true for exactly one frame per click — reset by
 * main.js calling input.flush() at the end of each frame).
 *
 * @returns {string|null}  Scene key to transition to ('game'), or null to stay.
 */
export function update() {
  const { x, y, clicked } = mouse;

  if (screen === 'intro') {
    if (hitTest(BTN_PLAY, x, y)) {
      hover = 'play';
      if (clicked) {
        audio.stop();
        return 'game'; // ← signal main.js to switch to the game scene
      }
    } else if (hitTest(BTN_INSTR, x, y)) {
      hover = 'instructions';
      if (clicked) {
        screen = 'instructions';
        hover  = null;
        // Music keeps playing — no audio change when opening instructions
      }
    } else {
      hover = null;
    }

  } else {
    // instructions sub-screen
    if (hitTest(BTN_BACK, x, y)) {
      hover = 'back';
      if (clicked) {
        screen = 'intro';
        hover  = null;
      }
    } else {
      hover = null;
    }
  }

  return null; // stay in this scene
}

/**
 * Render the current sub-screen.
 * @param {CanvasRenderingContext2D} ctx
 */
export function render(ctx) {
  if (screen === 'intro') {
    drawIntroScreen(ctx, hover);
  } else {
    drawInstructionsScreen(ctx, hover);
  }
}
