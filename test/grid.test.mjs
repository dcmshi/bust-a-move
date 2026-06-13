import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  COLS, ROWS,
  isValidCell,
  cellCenter,
  getNeighbors,
  snapToGrid,
  createGrid,
} from '../web/src/game/grid.js';

test('createGrid produces a ROWS×COLS grid of zeros', () => {
  const grid = createGrid();
  assert.equal(grid.length, ROWS);
  assert.equal(grid[0].length, COLS);
  assert.ok(grid.every(row => row.every(cell => cell === 0)));
});

test('isValidCell rejects out-of-bounds and the missing 8th slot on narrow rows', () => {
  assert.equal(isValidCell(0, 0), true);
  assert.equal(isValidCell(7, 0), true);   // even row has 8 slots
  assert.equal(isValidCell(7, 1), false);  // odd row only has 7 slots (col 0–6)
  assert.equal(isValidCell(-1, 0), false);
  assert.equal(isValidCell(0, ROWS), false);
});

test('cellCenter matches the verified Turing-derived coordinates', () => {
  assert.deepEqual(cellCenter(0, 0), { x: 206, y: 61 }); // even row start
  assert.deepEqual(cellCenter(0, 1), { x: 222, y: 89 }); // odd row +16px offset
  assert.equal(cellCenter(7, 1), null);                  // invalid slot
});

test('getNeighbors respects row parity and grid bounds', () => {
  // (2,0) on the ceiling row: up-neighbours are off-grid, so 4 remain.
  const n = getNeighbors(2, 0).map(({ col, row }) => `${col},${row}`).sort();
  assert.deepEqual(n, ['1,0', '1,1', '2,1', '3,0']);

  // Even vs odd rows lean their diagonals in opposite directions.
  const even = getNeighbors(3, 2).map(c => `${c.col},${c.row}`);
  const odd  = getNeighbors(3, 3).map(c => `${c.col},${c.row}`);
  assert.ok(even.includes('2,1')); // even leans LEFT (dCol -1) upward
  assert.ok(odd.includes('4,2'));  // odd leans RIGHT (dCol +1) upward
});

test('snapToGrid returns the nearest empty cell', () => {
  const grid = createGrid();
  assert.deepEqual(snapToGrid(206, 61, grid), { col: 0, row: 0 });
  // A point hovering just left of cell (1,0)=238 still snaps to the closest slot.
  const snap = snapToGrid(232, 61, grid);
  assert.deepEqual(snap, { col: 1, row: 0 });
});

test('snapToGrid skips occupied cells', () => {
  const grid = createGrid();
  grid[0][0] = 5; // occupy the exact target
  const snap = snapToGrid(206, 61, grid);
  assert.notDeepEqual(snap, { col: 0, row: 0 });
  assert.equal(grid[snap.row][snap.col], 0);
});

test('snapToGrid returns null when the grid is full', () => {
  const grid = createGrid();
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (isValidCell(col, row)) grid[row][col] = 1;
    }
  }
  assert.equal(snapToGrid(300, 300, grid), null);
});
