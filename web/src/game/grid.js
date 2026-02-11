/**
 * grid.js
 * Hex grid layout, coordinate math, neighbour calculation, and snap logic.
 *
 * Grid is 8 columns × 12 rows, 0-indexed (col 0-7, row 0-11).
 *
 * Turing used 1-indexed (x2 1-8, y2 1-12). Conversion: col = x2-1, row = y2-1.
 *
 * Row parity (0-indexed) ↔ Turing row parity:
 *   row % 2 === 0  →  "odd Turing row"  → 8 slots, cell x starts at 206
 *   row % 2 === 1  →  "even Turing row" → 7 slots, cell x starts at 222 (+16px offset)
 *
 * Neighbour diagonals reflect the stagger direction:
 *   row % 2 === 0  → diagonals shift LEFT  (-1, ±1)
 *   row % 2 === 1  → diagonals shift RIGHT (+1, ±1)
 *
 * All coordinates are in canvas space (origin top-left).
 * Conversion from Turing space: canvasY = 449 - turingY
 */

export const COLS        = 8;
export const ROWS        = 12;
export const BUBBLE_SIZE = 32; // px, bubbles are 32×32

// --- Validity -----------------------------------------------------------------

/**
 * Returns true if (col, row) is a real slot in the grid.
 * Odd JS rows (even Turing rows) only have 7 columns (col 0–6).
 */
export function isValidCell(col, row) {
  if (row < 0 || row >= ROWS) return false;
  if (col < 0 || col >= COLS) return false;
  if (row % 2 === 1 && col === 7) return false; // narrow rows have no 8th slot
  return true;
}

// --- Cell centres -------------------------------------------------------------

/**
 * Returns the centre of a grid cell in canvas coordinates, or null if invalid.
 *
 * Derived from Turing formulas (converted to 0-indexed + canvas Y):
 *   even JS row:  x = 206 + 32*col,  y = 61 + 28*row
 *   odd  JS row:  x = 222 + 32*col,  y = 61 + 28*row
 *
 * Verification:
 *   (col=0, row=0) → x=206, y=61   ← Turing xPos(1,1)=206, yPos(1,1)=388 → canvas 61 ✓
 *   (col=0, row=1) → x=222, y=89   ← Turing xPos(1,2)=222, yPos(1,2)=360 → canvas 89 ✓
 *   (col=7, row=1) → null           ← Turing xPos(8,2)=0 (invalid slot)  ✓
 */
export function cellCenter(col, row) {
  if (!isValidCell(col, row)) return null;
  return {
    x: (row % 2 === 0 ? 206 : 222) + BUBBLE_SIZE * col,
    y: 61 + 28 * row,
  };
}

/**
 * Pre-computed lookup table of cell centres.
 * CELL_CENTERS[row][col] → {x, y} or null for invalid slots.
 * Use this in hot paths (snap, collision) instead of calling cellCenter() in a loop.
 */
export const CELL_CENTERS = Array.from({ length: ROWS }, (_, row) =>
  Array.from({ length: COLS }, (_, col) => cellCenter(col, row))
);

// --- Neighbours ---------------------------------------------------------------

/**
 * The six neighbour offsets [dCol, dRow] for each row parity.
 *
 * Even JS rows (8-slot rows, un-shifted):
 *   same row ±1, then diagonals lean LEFT (dCol = -1)
 *
 * Odd JS rows (7-slot rows, shifted right):
 *   same row ±1, then diagonals lean RIGHT (dCol = +1)
 *
 * Derived from colourCountCheck in the original source.
 */
const NEIGHBOUR_OFFSETS = {
  even: [ [+1,0], [-1,0], [0,-1], [-1,-1], [0,+1], [-1,+1] ],
  odd:  [ [+1,0], [-1,0], [0,-1], [+1,-1], [0,+1], [+1,+1] ],
};

/**
 * Returns all valid neighbouring cells of (col, row).
 * @returns {{ col: number, row: number }[]}
 */
export function getNeighbors(col, row) {
  const offsets = row % 2 === 0 ? NEIGHBOUR_OFFSETS.even : NEIGHBOUR_OFFSETS.odd;
  const result  = [];
  for (const [dc, dr] of offsets) {
    const nc = col + dc;
    const nr = row + dr;
    if (isValidCell(nc, nr)) result.push({ col: nc, row: nr });
  }
  return result;
}

// --- Snap ---------------------------------------------------------------------

/**
 * Snap a flying bubble to the nearest empty grid slot.
 *
 * @param {number} bx    Bubble centre X in canvas space
 * @param {number} by    Bubble centre Y in canvas space
 * @param {number[][]} grid  Current grid state (grid[row][col], 0 = empty)
 * @returns {{ col: number, row: number }}
 */
export function snapToGrid(bx, by, grid) {
  let closestDist = Infinity;
  let snapCol = 0;
  let snapRow = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const center = CELL_CENTERS[row][col];
      if (center === null)         continue; // invalid slot
      if (grid[row][col] !== 0)    continue; // already occupied

      const dist = Math.hypot(bx - center.x, by - center.y);
      if (dist < closestDist) {
        closestDist = dist;
        snapCol     = col;
        snapRow     = row;
      }
    }
  }

  return { col: snapCol, row: snapRow };
}

// --- Grid factory -------------------------------------------------------------

/**
 * Create a fresh empty grid: grid[row][col] = 0 for all cells.
 * @returns {number[][]}
 */
export function createGrid() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}
