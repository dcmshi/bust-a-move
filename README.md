# Bust-A-Move Bust!

A Bust-A-Move / Bubble Bobble clone written in **Turing** (Open Turing), created as a school project at Turing in June 2007.

**Authors:** David Shi & Jason Hwang
**Date:** June 13, 2007
**Language:** [Open Turing](http://tristan.hume.ca/openturing/) (`.t`)

---

## About

Bust-A-Move Bust! is a faithful imitation of the classic arcade game *Bubble Bobble* / *Bust-A-Move*. Most graphics are sourced from the original game. Core gameplay is preserved, with some additional features including background music, a lives system, and no score tracking.

The goal is to clear all bubbles from the board by shooting bubbles from a cannon at the bottom of the screen. Matching 3 or more connected bubbles of the same color causes them to pop. Any bubbles left floating with no connection to the ceiling also fall off. Clear all 12 levels to win.

---

## Gameplay

### Controls
| Key | Action |
|-----|--------|
| `Left Arrow` | Rotate cannon left |
| `Right Arrow` | Rotate cannon right |
| `Space` | Fire bubble |

### Rules
- Shoot colored bubbles from the cannon at the bottom of the screen.
- When 3 or more bubbles of the same color are connected, they pop.
- Bubbles that become disconnected from the ceiling also disappear.
- If any bubble reaches row 12 (the bottom), you lose a life.
- You have **3 lives**. Losing all 3 ends the game.
- Clear all bubbles to advance to the next level.
- There are **12 levels** total. Completing all of them shows the win screen.

### Bubble Colors
| ID | Color  |
|----|--------|
| 1  | Blue   |
| 2  | Green  |
| 3  | Grey   |
| 4  | Orange |
| 5  | Purple |
| 6  | Yellow |
| 7  | Red    |
| 8  | White  |

---

## Technical Details

### Architecture
The game is a single-file Turing program (`Bust-A-Move Bust!.t`) structured as a sequence of procedures and a main game loop.

**Key procedures:**
- `gameLevel` — Clears the board and populates it with the bubble layout for the current level. Also switches the background image and background music.
- `gameOver` — Checks if bubbles have reached row 12 and either deducts a life (restarting the level) or shows the game over screen.
- `drawScene` — Renders the background, bubble grid, cannon, next-bubble preview, and lives HUD every frame.
- `trackInput` — Reads keyboard input to rotate the cannon angle or fire.
- `vectorToXY` — Converts the cannon angle to a velocity vector using trigonometry (`cosd`/`sind`).
- `bubbleSnap` — After a bubble stops, snaps it to the nearest empty grid slot using `Math.Distance`.
- `colourCountCheck` — Recursive procedure that walks connected same-color neighbors and counts them.
- `colourCheck` — Recursive procedure that clears the group once `colourCount >= 3`.
- `ballDrop` — Scans the grid and removes any bubbles not supported by the row above.
- `newLevel` — Counts remaining bubbles; advances to the next level when the board is clear.

### Grid
The playing field is an 8×12 hexagonal grid. Odd rows hold up to 8 bubbles; even rows hold up to 7 (offset by half a bubble width for the staggered hex layout).

### Rendering
Uses Turing's `offscreenonly` mode with `View.Update` at the end of each frame for smooth double-buffered animation.

### Music
Each level plays a different MP3 track using `Music.PlayFileLoop`:

| Levels | Track |
|--------|-------|
| 1, 5, 9  | The Postal Service - Such Great Heights |
| 2, 6, 10 | Röyksopp - Remind Me |
| 3, 7, 11 | Hellogoodbye - Here (In Your Arms) |
| 4, 8, 12 | Sandstorm (Techno) |
| Win screen | Hot Hot Heat - Talk to Me, Dance With Me |
| Game over  | Plain White T's |

---

## Assets

All assets are in the project root alongside the source file.

**Graphics (BMP):**
`back`, `bluebubble`, `gameover`, `gameover2`, `greenbubble`, `greybubble`, `gun`, `instructions`, `levelbackground` (×4), `life1/2/3`, `mainTitle`, `man`, `next`, `orangebubble`, `play`, `purplebubble`, `redbubble`, `shooter`, `what`, `whitebubble`, `yellowbubble`

**Music (MP3):**
6 tracks bundled in the project root (see table above).

**Executable:**
`Bust-A-Move Bust!.exe` — pre-compiled Windows executable for running without the Turing IDE.

---

## Play Now

**[https://bust-a-move.onrender.com](https://bust-a-move.onrender.com)**

![Bust-A-Move Bust! screenshot](game_screenshot.png)

---

## Running the Game

### Option 1: Browser port (JavaScript)
A full browser port lives in `web/`. It requires a local HTTP server (ES modules don't work over `file://`).

**Using Node.js / nvm:**
```
nvm install lts
nvm use lts
npx serve .
```
Then open **`http://localhost:3000/web/`** in your browser.

> Serve from the project root (`.`), not `web/` — the assets (BMP/MP3) live in the root and are referenced via `../` from `web/src/assets.js`.

### Option 2: Deploy to Render
The live deployment at **[https://bust-a-move.onrender.com](https://bust-a-move.onrender.com)** is hosted on Render as a static site.

To redeploy or fork your own instance:
1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Blueprint** and connect the repo.
3. Render picks up `render.yaml` automatically and creates a static site.
4. The root `index.html` redirects visitors to `/web/` where the game lives.

> BMP and MP3 assets are served from the project root and referenced via `../` from `web/src/assets.js`.

### Option 3: Pre-compiled executable
Double-click `Bust-A-Move Bust!.exe`. Requires all BMP and MP3 files to be in the same directory.

### Option 4: Open Turing IDE
1. Install [Open Turing](http://tristan.hume.ca/openturing/).
2. Open `Bust-A-Move Bust!.t` in the IDE.
3. Press **F2** (or Run → Run) to start.

---

## License

School project — no explicit license. Graphics and music are from their respective original owners.
