/**
 * audio.js
 * Thin wrapper around HTML5 <audio> elements loaded by assets.js.
 *
 * Browsers block audio until the first user gesture. playLoop() calls
 * .play().catch(() => {}) so that a blocked autoplay attempt is silently
 * swallowed; subsequent user interaction (e.g. the Play button click on
 * the intro screen) naturally unblocks audio.
 *
 * Turing mapping:
 *   Music.PlayFileLoop(file)  →  playLoop(key)
 *   Music.PlayFileStop        →  stop()
 */

import { audio as audioMap } from './assets.js';

// Key of the track that is currently playing (or null).
let currentKey = null;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Start looping a track by its asset key (e.g. 'intro', 'track1', 'win').
 * No-op if that track is already playing.
 * @param {string} key
 */
export function playLoop(key) {
  if (currentKey === key) return;
  stop();
  currentKey = key;
  const el = audioMap[key];
  if (!el) return;
  el.loop        = true;
  el.currentTime = 0;
  el.play().catch(() => {}); // silently ignore autoplay-policy blocks
}

/**
 * Stop the currently playing track (if any).
 */
export function stop() {
  if (!currentKey) return;
  const el = audioMap[currentKey];
  if (el) {
    el.pause();
    el.currentTime = 0;
  }
  currentKey = null;
}

/**
 * Play a track once (non-looping). Used for short sound effects if needed.
 * @param {string} key
 */
export function playOnce(key) {
  const el = audioMap[key];
  if (!el) return;
  el.loop        = false;
  el.currentTime = 0;
  el.play().catch(() => {});
}
