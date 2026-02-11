/**
 * convert-assets.js
 * Converts BMP sprite files to PNG with background transparency.
 *
 * Uses the top-left pixel of each image as the "transparent" colour
 * (mirrors Turing's picMerge behaviour, which treats that background
 * colour as transparent).
 *
 * Output: web/assets/<name>.png
 *
 * Usage (from project root):
 *   npm install jimp
 *   node convert-assets.js
 */

const Jimp   = require('jimp');
const path   = require('path');
const fs     = require('fs');

const ROOT   = __dirname;
const OUTPUT = path.join(ROOT, 'web', 'assets');

// Only the sprites that need transparency in the browser port.
// Backgrounds, HUD frames and full-screen images look fine as-is.
const FILES = [
  'bluebubble.bmp',
  'greenbubble.bmp',
  'greybubble.bmp',
  'orangebubble.bmp',
  'purplebubble.bmp',
  'yellowbubble.bmp',
  'redbubble.bmp',
  'whitebubble.bmp',
  'shooter.bmp',
];

if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

async function convert(filename) {
  const src  = path.join(ROOT, filename);
  const dest = path.join(OUTPUT, filename.replace('.bmp', '.png'));

  const img  = await Jimp.read(src);
  const { data } = img.bitmap;

  // Sample the top-left pixel as the background colour to key out
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (_x, _y, idx) => {
    if (data[idx] === bgR && data[idx + 1] === bgG && data[idx + 2] === bgB) {
      data[idx + 3] = 0; // fully transparent
    }
  });

  // jimp 0.x uses writeAsync; jimp 1.x uses write — try both
  if (typeof img.writeAsync === 'function') {
    await img.writeAsync(dest);
  } else {
    await img.write(dest);
  }

  console.log(`  ${filename.padEnd(22)} → web/assets/${path.basename(dest)}`);
}

(async () => {
  console.log('Converting sprites...\n');
  for (const file of FILES) {
    await convert(file);
  }
  console.log('\nDone. Run: npx serve . and open http://localhost:3000/web/');
})().catch(err => { console.error(err); process.exit(1); });
