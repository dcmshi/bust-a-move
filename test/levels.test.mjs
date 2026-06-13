import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createGrid } from '../web/src/game/grid.js';
import { fillLevel, trackForLevel, LEVEL_COUNT } from '../web/src/game/levels.js';

test('LEVEL_COUNT is 12', () => {
  assert.equal(LEVEL_COUNT, 12);
});

test('trackForLevel cycles through the four tracks', () => {
  assert.equal(trackForLevel(1), 'track1');
  assert.equal(trackForLevel(4), 'track4');
  assert.equal(trackForLevel(5), 'track1'); // wraps
});

test('fillLevel clears any prior state before populating', () => {
  const grid = createGrid();
  grid[11][0] = 9; // stale bubble in the last row
  fillLevel(1, grid);
  assert.equal(grid[11][0], 0); // cleared
  assert.equal(grid[0][0], 7);  // level 1, row 0, col 0 is red (7)
});

test('level 2 has two fixed grey bubbles and a random central column', () => {
  const grid = createGrid();
  fillLevel(2, grid);
  assert.equal(grid[0][3], 3);
  assert.equal(grid[0][4], 3);
  for (let row = 1; row <= 7; row++) {
    assert.ok(grid[row][3] >= 1 && grid[row][3] <= 8);
  }
});

test('every static level only places bubbles in valid slots and colours 1–8', () => {
  for (let level = 1; level <= LEVEL_COUNT; level++) {
    const grid = createGrid();
    fillLevel(level, grid);
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const v = grid[row][col];
        if (v !== 0) {
          assert.ok(v >= 1 && v <= 8, `level ${level} (${col},${row}) colour ${v} out of range`);
          // narrow (odd) rows must not use the 8th column
          if (row % 2 === 1) assert.notEqual(col, 7, `level ${level} placed in invalid slot (7,${row})`);
        }
      }
    }
  }
});
