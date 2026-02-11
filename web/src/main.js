/**
 * main.js
 * Entry point: asset loading, requestAnimationFrame game loop, scene routing.
 *
 * Scene interface contract (all scenes must export):
 *   enter(...args)           called once when switching to this scene
 *   update() → string|null  returns a scene key to transition, or null to stay
 *   render(ctx)              draw one frame
 *
 * Scene keys:
 *   'intro'         → intro + instructions screen
 *   'game'          → main game
 *   'gameover-win'  → win end screen
 *   'gameover-lose' → lose end screen
 */

import { loadAll }          from './assets.js';
import { flush }            from './input.js';
import * as introScene      from './scenes/intro.js';
import * as gameScene       from './scenes/game.js';
import * as gameoverScene   from './scenes/gameover.js';

// ── Canvas ────────────────────────────────────────────────────────────────────

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('main-canvas'));
const ctx    = canvas.getContext('2d');

// ── Scene routing ─────────────────────────────────────────────────────────────

let currentScene = null;

/**
 * Switch to a new scene by key.
 * @param {string} key
 */
function switchTo(key) {
  switch (key) {
    case 'intro':
      currentScene = introScene;
      introScene.enter();
      break;
    case 'game':
      currentScene = gameScene;
      gameScene.enter();
      break;
    case 'gameover-win':
      currentScene = gameoverScene;
      gameoverScene.enter(true);
      break;
    case 'gameover-lose':
      currentScene = gameoverScene;
      gameoverScene.enter(false);
      break;
    default:
      console.warn('Unknown scene key:', key);
  }
}

// ── Game loop ─────────────────────────────────────────────────────────────────

function loop() {
  requestAnimationFrame(loop);

  const next = currentScene.update();
  currentScene.render(ctx);

  // Transition after render so the last frame of the current scene is visible
  if (next) switchTo(next);

  // Reset one-frame input flags (mouse.clicked, etc.)
  flush();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function init() {
  const bar    = document.getElementById('loading-bar');
  const status = document.getElementById('loading-status');

  // loadAll calls onProgress(fraction) where fraction is 0–1
  await loadAll((fraction) => {
    const pct = Math.round(fraction * 100);
    if (bar)    bar.style.width    = pct + '%';
    if (status) status.textContent = `Loading assets… ${pct}%`;
  });

  // Hide loading overlay
  const overlay = document.getElementById('loading');
  if (overlay) overlay.style.display = 'none';

  // Start on the intro screen
  switchTo('intro');
  requestAnimationFrame(loop);
}

init();
