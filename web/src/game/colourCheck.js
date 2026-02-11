/**
 * game/colourCheck.js
 * BFS flood-fill colour-match and pop logic.
 *
 * Replaces the original recursive colourCheck / colourCountCheck procedures,
 * which had known adjacency bugs and stack-overflow risk.
 *
 * The BFS approach:
 *   1. Starting from the newly placed cell (col, row), walk all connected
 *      cells that share the same colour using getNeighbors().
 *   2. If the cluster is ≥ 3 cells, clear every cell in it (set to 0).
 *   3. Return whether any cells were popped.
 *
 * NOTE: game-over is intentionally checked AFTER this pop step in game.js,
 * so a bubble landing in the last row that completes a match gets cleared
 * rather than causing an immediate game-over. This is an improvement over
 * the original which ran gameOver() inside colourCountCheck() before popping.
 */

import { getNeighbors } from './grid.js';

/**
 * Check for a colour match starting at (col, row) and pop if size ≥ 3.
 *
 * @param {number[][]} grid  grid[row][col], 0 = empty. Mutated in place.
 * @param {number}     col
 * @param {number}     row
 * @returns {boolean}  true if any cells were cleared.
 */
export function checkAndPop(grid, col, row) {
  const color = grid[row]?.[col];
  if (!color) return false;

  // BFS to collect the full same-colour connected cluster
  const cluster = [];
  const visited = new Set();
  const queue   = [{ col, row }];

  while (queue.length > 0) {
    const { col: c, row: r } = queue.shift();
    const key = `${c},${r}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (grid[r][c] !== color) continue;  // different colour — stop expanding
    cluster.push({ col: c, row: r });

    for (const n of getNeighbors(c, r)) {
      if (!visited.has(`${n.col},${n.row}`) && grid[n.row][n.col] === color) {
        queue.push(n);
      }
    }
  }

  if (cluster.length < 3) return false;

  for (const { col: c, row: r } of cluster) {
    grid[r][c] = 0;
  }
  return true;
}
