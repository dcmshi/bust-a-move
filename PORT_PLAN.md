# Bust-A-Move JS Port Plan

## Constraints
- Do NOT modify the original Turing files
- Port one feature at a time
- Target: runs natively in browser (no bundler required)
- ES modules only (`import`/`export`)

---

## Architecture

### Rendering
- HTML5 Canvas, fixed `640×450`
- **Two-canvas strategy:**
  - `bubbleCanvas` (offscreen) — bubble grid only, redrawn on land/pop
  - `mainCanvas` (visible) — composited each frame: background → bubbleCanvas → HUD → shooter → live bubble
  - Replaces Turing's `Pic.New(190, 90, 448, 404)` snapshot trick

### Game Loop
- `requestAnimationFrame` + state machine (replaces Turing's blocking `loop`)
- States: `LOADING → INTRO → INSTRUCTIONS → GAME → GAME_OVER / WIN`
- Each scene exports `update(dt)` and `render(ctx)`

### Input
- Event-driven listeners → polled via state object (preserves Turing's polled feel)
- `keys = new Set()` populated by `keydown`/`keyup`
- `mouse = { x, y, down }` updated by `mousemove` / `mousedown` / `mouseup`

### Audio
- HTML5 `<audio>` with `loop`, one instance per track
- `playLoop(track)` / `stop()` wrapper

### Arrays
- All grid arrays converted from 1-indexed to 0-indexed
- Grid is 8 columns × 12 rows

### Colour Matching
- Iterative BFS flood-fill replaces the original recursive `colourCheck` / `colourCountCheck`
- Same behaviour: find connected same-colour cluster, pop if size ≥ 3

### Assets
- BMP → PNG (browser compatibility)
- MP3 stays as-is

---

## File Structure

```
/                        ← original Turing files untouched
web/
  index.html
  assets/                ← PNG + MP3 files
  src/
    main.js              ← entry point, rAF loop, scene routing
    input.js             ← keyboard + mouse state
    audio.js             ← HTML5 Audio wrapper
    assets.js            ← preload images + audio (Promise-based)
    scenes/
      intro.js           ← intro + instructions screen
      game.js            ← main game scene coordinator
      gameover.js        ← win/lose screens
    game/
      grid.js            ← hex grid math, xPos/yPos tables, snap logic
      bubble.js          ← bubble motion, wall bounce, ceiling check
      levels.js          ← all 12 level definitions
      colourCheck.js     ← BFS flood-fill match + pop logic
      ballDrop.js        ← disconnection/gravity sweep
      renderer.js        ← all canvas draw calls
```

---

## Turing → JS Mapping Reference

| Turing | JavaScript |
|--------|-----------|
| `maxx = 640, maxy = 450` | Canvas `640×450` |
| `setscreen("offscreenonly")` | `requestAnimationFrame` double-buffer |
| `View.Update` | end of rAF callback |
| `Pic.FileNew(file)` | `new Image()` preloaded in `assets.js` |
| `Pic.ScreenLoad(file, x, y, mode)` | `ctx.drawImage(img, x, y)` |
| `Pic.Draw(picID, x, y, mode)` | `ctx.drawImage(img, x, y)` |
| `Pic.Rotate(picID, angle, cx, cy)` | `ctx.save/translate/rotate/restore` per frame (no pre-render needed) |
| `Pic.New(x1, y1, x2, y2)` | Offscreen `bubbleCanvas` |
| `drawfillbox(x1,y1,x2,y2,c)` | `ctx.fillRect` |
| `drawbox(x1,y1,x2,y2,c)` | `ctx.strokeRect` |
| `mousewhere(mx, my, mb)` | `input.mouse.x/y/down` |
| `Input.KeyDown(chars)` | `input.keys.has('ArrowLeft')` etc. |
| `Music.PlayFileLoop(mp3)` | `audio.playLoop(track)` |
| `Music.PlayFileStop` | `audio.stop()` |
| `Rand.Int(1, 8)` | `Math.floor(Math.random() * 8) + 1` |
| `Math.Distance(x1,y1,x2,y2)` | `Math.hypot(x2-x1, y2-y1)` |
| `cosd(a)` / `sind(a)` | `Math.cos(a * Math.PI/180)` |
| `arcsind(x)` | `Math.asin(x) * 180/Math.PI` |
| `round(x)` | `Math.round(x)` |
| `type bubbleType record` | `{ x, y, c }` plain object |
| `array 1..8, 1..12 of int` | `Array(12).fill(0).map(()=>Array(8).fill(0))` (0-indexed) |
| `proc name(...)` | `function name(...)` |
| Blocking `loop` screens | State machine scenes |
| Recursive flood-fill | Iterative BFS queue |

---

## Build Order (feature by feature)

- [x] 1. `index.html` + `assets.js` — scaffolding + preloader
- [x] 2. `input.js` — keyboard + mouse state
- [x] 3. `grid.js` — hex grid math, coordinate tables, snap
- [x] 4. `levels.js` — all 12 level layouts
- [x] 5. `renderer.js` — canvas draw calls, shooter rotation (real-time ctx.rotate)
- [x] 6. `scenes/intro.js` — main menu + instructions screen
- [x] 7. `game/bubble.js` — bubble motion, wall, ceiling
- [x] 8. `game/colourCheck.js` — BFS flood-fill match + pop
- [x] 9. `game/ballDrop.js` — disconnection sweep
- [x] 10. `scenes/game.js` — game scene coordinator
- [x] 11. `audio.js` — music wrapper
- [x] 12. `scenes/gameover.js` — win/lose screens
- [x] 13. `main.js` — entry point, scene router, rAF loop

---

## Decisions & Notes

### Coordinate system
- Turing origin is **bottom-left** (y=0 at bottom, increases upward)
- Canvas origin is **top-left** (y=0 at top, increases downward)
- Conversion for Turing `Pic.Draw(img, tx, ty)` → canvas: `ctx.drawImage(img, tx, 450 - ty - img.height)`
- `ty(turingY)` helper in `input.js` converts mouse Y for hit-testing: `449 - turingY`
- All grid coordinates in `grid.js` (`CELL_CENTERS`) are already in **canvas space**

### Shooter rotation
- Turing pre-rendered 180 rotated images for performance (2007 hardware)
- JS port uses `ctx.save/translate/rotate/restore` per frame — trivially fast at 60fps
- Rotation pivot in image: `(cx=63, cy=img.height-59)` (cy=59 was from bottom in Turing)
- `ctx.rotate((ang - 90) * Math.PI / 180)` — ang=90 is straight up, no rotation needed

### BMP transparency (known issue)
- Original uses `picMerge` mode which treats black pixels as transparent
- BMP files have no alpha channel — bubbles will show with black rectangles until images are converted to PNG with proper alpha transparency
- Recommendation: use an image editor or script to convert all `.bmp` → `.png` with black (`#000000`) as the transparent colour, then update `assets.js` paths

### Bubble canvas
- `ballBackground := Pic.New(190, 90, 448, 404)` in Turing → offscreen `bubbleCanvas` (full 640×450)
- Redrawn only when a bubble lands, pops, or drops — not every frame
- Composited over background via `ctx.drawImage(bubbleCanvas, 0, 0)`

### Audio autoplay
- Browsers block audio until first user gesture
- Intro screen click (Play button) serves as the first gesture — audio starts there
- `audio.js` must handle graceful no-op if a track hasn't been interacted with yet

### Colour matching (known bug in original)
- The recursive `colourCheck` / `colourCountCheck` in the original has a known bug
- JS port uses iterative BFS flood-fill in `colourCheck.js` — cleaner and bug-free
- Unit tests planned for edge cases (corners, ceiling row, odd/even row adjacency)

### Level 2
- Contains a random column — `fillLevel(2, grid)` re-randomises on each call
- This means retrying level 2 after losing a life gives a new layout (matches original behaviour)

### Active bubble position
- Stored as **canvas-space centre** `{ x, y }` throughout the JS port
- Turing stored bottom-left in its y-up space; initial position `(302, 39)` in Turing = canvas centre `(318, 395)`
- Wall bounds (canvas x): left wall ≤ 190, right wall ≥ 448
- Ceiling (canvas y): ≤ 45 (top of grid row 0 minus bubble radius)
