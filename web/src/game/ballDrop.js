/**
 * game/ballDrop.js
 * Disconnected-bubble sweep: remove any bubble not reachable from the ceiling row.
 *
 * Replaces the original `ballDrop` procedure, which used a fragile one-step
 * upward-neighbour check (many edge cases, incorrect at corners and odd/even
 * row boundaries). The BFS approach is correct by construction.
 *
 * Algorithm:
 *   1. Seed the reachable set with every non-empty cell in row 0 (ceiling).
 *   2. BFS-expand to all neighbouring occupied cells.
 *   3. Any occupied cell NOT in the reachable set is disconnected — clear it.
 */

import { getNeighbors, ROWS, COLS } from './grid.js';

/**
 * Remove all bubbles that are no longer connected to the ceiling row.
 * Mutates the grid in place.
 *
 * @param {number[][]} grid  grid[row][col], 0 = empty.
 * @returns {boolean}  true if at least one bubble was dropped.
 */
export function dropDisconnected(grid) {
  const reachable = new Set();
  const queue     = [];

  // Seed: every non-empty cell in ceiling row (row 0)
  for (let col = 0; col < COLS; col++) {
    if (grid[0][col]) {
      const key = `${col},0`;
      reachable.add(key);
      queue.push({ col, row: 0 });
    }
  }

  // BFS over all occupied neighbours
  while (queue.length > 0) {
    const { col, row } = queue.shift();
    for (const n of getNeighbors(col, row)) {
      const key = `${n.col},${n.row}`;
      if (!reachable.has(key) && grid[n.row][n.col]) {
        reachable.add(key);
        queue.push(n);
      }
    }
  }

  // Clear any occupied cell not in the reachable set
  let dropped = false;
  for (let row = 1; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col] && !reachable.has(`${col},${row}`)) {
        grid[row][col] = 0;
        dropped = true;
      }
    }
  }
  return dropped;
}
