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

// Global one-shot unlock: as soon as ANY pointer or key event fires,
// retry the pending track. Browsers unblock audio on the first user gesture.
function _unlockHandler() {
  if (currentKey) {
    const el = audioMap[currentKey];
    if (el && el.paused) {
      _applyVolume(el);
      el.play().catch(() => {});
    }
  }
}
document.addEventListener('pointerdown', _unlockHandler);
document.addEventListener('keydown',     _unlockHandler);

// Volume state (applied to every element on play and on change).
let _volume = 0.3;
let _muted  = false;

/** Apply current volume/mute to a single audio element. */
function _applyVolume(el) {
  el.volume = _volume;
  el.muted  = _muted;
}

/** Apply current volume/mute to all loaded audio elements. */
function _applyVolumeAll() {
  for (const el of Object.values(audioMap)) _applyVolume(el);
}

/**
 * Set playback volume (0–1). Persists across track changes.
 * @param {number} v  0.0 to 1.0
 */
export function setVolume(v) {
  _volume = Math.max(0, Math.min(1, v));
  _applyVolumeAll();
}

/**
 * Mute or unmute all audio.
 * @param {boolean} muted
 */
export function setMuted(muted) {
  _muted = muted;
  _applyVolumeAll();
}

/** Current volume (0–1). */
export function getVolume() { return _volume; }

/** Whether audio is currently muted. */
export function getMuted()  { return _muted; }

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
  _applyVolume(el);
  el.play().catch(() => {}); // blocked autoplay is recovered by the global _unlockHandler
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
  _applyVolume(el);
  el.play().catch(() => {});
}
