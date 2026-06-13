import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createGrid } from '../web/src/game/grid.js';
import { dropDisconnected } from '../web/src/game/ballDrop.js';

test('bubbles connected to the ceiling row stay', () => {
  const grid = createGrid();
  grid[0][0] = 1; // on the ceiling
  grid[1][0] = 1; // (1,0) is a neighbour of (0,0) → connected
  const dropped = dropDisconnected(grid);
  assert.equal(dropped, false);
  assert.equal(grid[0][0], 1);
  assert.equal(grid[1][0], 1);
});

test('a bubble with no path to the ceiling is dropped', () => {
  const grid = createGrid();
  grid[5][5] = 4; // floating in the middle, nothing above it
  const dropped = dropDisconnected(grid);
  assert.equal(dropped, true);
  assert.equal(grid[5][5], 0);
});

test('only the disconnected part of a mixed board is cleared', () => {
  const grid = createGrid();
  grid[0][0] = 1; // anchored to ceiling
  grid[1][0] = 1; // connected chain
  grid[7][7] = 2; // detached
  const dropped = dropDisconnected(grid);
  assert.equal(dropped, true);
  assert.equal(grid[0][0], 1);
  assert.equal(grid[1][0], 1);
  assert.equal(grid[7][7], 0);
});
