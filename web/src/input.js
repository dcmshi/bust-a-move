/**
 * input.js
 * Keyboard and mouse state, polled each frame.
 * Mouse coordinates are in canvas space (origin top-left).
 *
 * Turing uses bottom-left origin (y=0 at bottom, increases upward).
 * Canvas uses top-left origin (y=0 at top, increases downward).
 * Use ty(turingY) to convert when comparing against original Turing coordinates.
 *
 *   canvasY  = 449 - turingY
 *   turingY  = 449 - canvasY
 */

const canvas = document.getElementById('main-canvas');

// Keys currently held down. Use e.key values: 'ArrowLeft', 'ArrowRight', ' ', etc.
export const keys = new Set();

export const mouse = {
  x: 0,
  y: 0,
  down: false,    // true while button is held
  clicked: false, // true for exactly one frame on mousedown — cleared by flush()
};

// Only prevent default scroll behaviour for keys the game actually uses
const GAME_KEYS = new Set([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

window.addEventListener('keydown', e => {
  keys.add(e.key);
  if (GAME_KEYS.has(e.key)) e.preventDefault();
});

window.addEventListener('keyup', e => {
  keys.delete(e.key);
});

function updateMousePos(e) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  mouse.x = (e.clientX - rect.left) * scaleX;
  mouse.y = (e.clientY - rect.top)  * scaleY;
}

canvas.addEventListener('mousemove',  e => updateMousePos(e));
canvas.addEventListener('mousedown',  e => {
  updateMousePos(e);
  mouse.down    = true;
  mouse.clicked = true;
});
canvas.addEventListener('mouseup',    e => { updateMousePos(e); mouse.down = false; });
canvas.addEventListener('mouseleave', () => { mouse.down = false; });

/**
 * Returns true if the given key is currently held.
 * @param {string} key  e.g. 'ArrowLeft', 'ArrowRight', ' '
 */
export function isDown(key) {
  return keys.has(key);
}

/**
 * Convert a Turing Y coordinate to canvas Y coordinate.
 * @param {number} turingY  Y value in Turing space (0 = bottom of 450px screen)
 * @returns {number}        Y value in canvas space (0 = top)
 */
export function ty(turingY) {
  return 449 - turingY;
}

/**
 * Call once at the start of each frame to clear single-frame flags.
 * Keeps mouse.clicked true for exactly one update tick.
 */
export function flush() {
  mouse.clicked = false;
}
