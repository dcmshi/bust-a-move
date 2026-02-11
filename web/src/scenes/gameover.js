/**
 * scenes/gameover.js
 * Win and lose end screens.
 *
 * Turing displayed these as infinite blocking loops after stopping music
 * and starting a new track. In JS, the screens are a scene that plays
 * the appropriate track and waits for a click to return to the intro.
 *
 * Scene interface (same as intro.js):
 *   enter(won)        → called by main.js; won = true | false
 *   update() → string | null
 *   render(ctx)
 */

import { mouse }            from '../input.js';
import * as audio           from '../audio.js';
import { drawGameOverScreen } from '../game/renderer.js';

let won = false;

// ── Scene interface ───────────────────────────────────────────────────────────

/**
 * @param {boolean} didWin
 */
export function enter(didWin) {
  won = didWin;
  audio.stop();
  // Turing level-13 (win) plays "Hot Hot Heat"; lose plays "Plain White T's"
  audio.playLoop(won ? 'win' : 'lose');
}

/**
 * Any click returns the player to the intro screen.
 * @returns {string|null}
 */
export function update() {
  if (mouse.clicked) {
    audio.stop();
    return 'intro';
  }
  return null;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
export function render(ctx) {
  drawGameOverScreen(ctx, won);
}
