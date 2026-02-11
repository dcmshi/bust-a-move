/**
 * convert-assets.js
 * Converts BMP sprite files to transparent PNGs using only Node.js built-ins.
 * No npm install needed — just run: node convert-assets.js
 *
 * Supports 24-bit and 8-bit (paletted) BMPs.
 * Background colour is detected from the top-left pixel and made transparent.
 * Output: web/assets/<name>.png
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── CRC-32 (required by PNG chunk format) ────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ── PNG writer ────────────────────────────────────────────────────────────────

function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.slice(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePNG(width, height, rgba) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8]  = 8; // bit depth per channel
  ihdr[9]  = 6; // colour type: RGBA
  // bytes 10-12: compression=0, filter=0, interlace=0

  // Raw scanlines — each row prefixed with filter byte 0 (None)
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: None
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── BMP reader ────────────────────────────────────────────────────────────────

function decodeBMP(buf) {
  if (buf[0] !== 0x42 || buf[1] !== 0x4D) throw new Error('Not a valid BMP file');

  const pixelOffset  = buf.readUInt32LE(10);
  const dibSize      = buf.readUInt32LE(14);
  const width        = buf.readInt32LE(18);
  const rawHeight    = buf.readInt32LE(22);
  const bpp          = buf.readUInt16LE(28);
  const compression  = buf.readUInt32LE(30);
  const topDown      = rawHeight < 0;
  const height       = Math.abs(rawHeight);

  const rgba = Buffer.alloc(width * height * 4);

  if (bpp === 24 && compression === 0) {
    const rowStride = Math.ceil(width * 3 / 4) * 4;
    for (let y = 0; y < height; y++) {
      const srcRow = topDown ? y : (height - 1 - y);
      const base   = pixelOffset + srcRow * rowStride;
      for (let x = 0; x < width; x++) {
        const s = base + x * 3;
        const d = (y * width + x) * 4;
        rgba[d]     = buf[s + 2]; // R (BMP stores BGR)
        rgba[d + 1] = buf[s + 1]; // G
        rgba[d + 2] = buf[s + 0]; // B
        rgba[d + 3] = 255;
      }
    }
  } else if (bpp === 8) {
    const paletteOffset = 14 + dibSize;
    const numColors     = Math.min(256, (pixelOffset - paletteOffset) / 4);
    const palette       = [];
    for (let i = 0; i < numColors; i++) {
      const o = paletteOffset + i * 4;
      palette.push([buf[o + 2], buf[o + 1], buf[o + 0]]); // BGR → RGB
    }
    const rowStride = Math.ceil(width / 4) * 4;
    for (let y = 0; y < height; y++) {
      const srcRow = topDown ? y : (height - 1 - y);
      const base   = pixelOffset + srcRow * rowStride;
      for (let x = 0; x < width; x++) {
        const [r, g, b] = palette[buf[base + x]] || [0, 0, 0];
        const d = (y * width + x) * 4;
        rgba[d] = r; rgba[d+1] = g; rgba[d+2] = b; rgba[d+3] = 255;
      }
    }
  } else {
    throw new Error(`Unsupported BMP: ${bpp} bpp, compression=${compression}`);
  }

  return { width, height, rgba };
}

// ── Transparency ──────────────────────────────────────────────────────────────

function keyOutBackground(rgba, width, height) {
  // Use the top-left pixel colour as the background key
  const bgR = rgba[0], bgG = rgba[1], bgB = rgba[2];
  for (let i = 0; i < width * height; i++) {
    const d = i * 4;
    if (rgba[d] === bgR && rgba[d+1] === bgG && rgba[d+2] === bgB) rgba[d+3] = 0;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const ROOT   = __dirname;
const OUTPUT = path.join(ROOT, 'web', 'assets');
const FILES  = [
  'bluebubble.bmp',
  'greenbubble.bmp',
  'greybubble.bmp',
  'orangebubble.bmp',
  'purplebubble.bmp',
  'yellowbubble.bmp',
  'redbubble.bmp',
  'whitebubble.bmp',
  'shooter.bmp',
  'gun.bmp',
  'man.bmp',
  'next.bmp',
];

if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

console.log('Converting sprites…\n');
let ok = 0, fail = 0;
for (const filename of FILES) {
  const src  = path.join(ROOT, filename);
  const dest = path.join(OUTPUT, filename.replace('.bmp', '.png'));
  try {
    const { width, height, rgba } = decodeBMP(fs.readFileSync(src));
    keyOutBackground(rgba, width, height);
    fs.writeFileSync(dest, encodePNG(width, height, rgba));
    console.log(`  ✓  ${filename.padEnd(22)} → web/assets/${path.basename(dest)}`);
    ok++;
  } catch (e) {
    console.error(`  ✗  ${filename}: ${e.message}`);
    fail++;
  }
}
console.log(`\n${ok} converted, ${fail} failed.`);
if (ok > 0) console.log('Restart your dev server and refresh the browser.');
