import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createGrid } from '../web/src/game/grid.js';
import { checkAndPop } from '../web/src/game/colourCheck.js';

test('a cluster of 3+ same-colour bubbles pops', () => {
  const grid = createGrid();
  grid[0][0] = 5;
  grid[0][1] = 5;
  grid[0][2] = 5; // three-in-a-row, all connected on the even ceiling row
  const popped = checkAndPop(grid, 1, 0);
  assert.equal(popped, true);
  assert.equal(grid[0][0], 0);
  assert.equal(grid[0][1], 0);
  assert.equal(grid[0][2], 0);
});

test('a cluster of only 2 does not pop', () => {
  const grid = createGrid();
  grid[0][0] = 5;
  grid[0][1] = 5;
  const popped = checkAndPop(grid, 0, 0);
  assert.equal(popped, false);
  assert.equal(grid[0][0], 5);
  assert.equal(grid[0][1], 5);
});

test('the flood fill stops at a different colour', () => {
  const grid = createGrid();
  grid[0][0] = 5;
  grid[0][1] = 5;
  grid[0][2] = 3; // breaks the run — only two 5s are connected
  const popped = checkAndPop(grid, 0, 0);
  assert.equal(popped, false);
  assert.equal(grid[0][2], 3);
});

test('checkAndPop on an empty cell is a no-op', () => {
  const grid = createGrid();
  assert.equal(checkAndPop(grid, 0, 0), false);
});
