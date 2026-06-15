#!/usr/bin/env node
// Pure Node.js PNG icon generator — no external dependencies
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public/icons')

// ─── CRC32 ────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function u32be(n) {
  return Buffer.from([(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF])
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = u32be(data.length)
  const crcInput = Buffer.concat([typeBytes, data])
  const crc = u32be(crc32(crcInput))
  return Buffer.concat([len, typeBytes, data, crc])
}

// ─── PNG Writer ───────────────────────────────────────────────
function makePNG(width, height, getPixel) {
  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type: RGB
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace

  // Raw pixel data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 3))
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 3)] = 0 // None filter
    for (let x = 0; x < width; x++) {
      const [r, g, b] = getPixel(x, y)
      const off = y * (1 + width * 3) + 1 + x * 3
      rawData[off] = r
      rawData[off + 1] = g
      rawData[off + 2] = b
    }
  }

  const compressed = deflateSync(rawData, { level: 9 })

  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// ─── Icon Design ──────────────────────────────────────────────
// Background: #1D1A15 (29, 26, 21) — dark
// Circle:     #D85C32 (216, 92, 50) — accent orange-red
// Inner dot:  #F4EFE6 (244, 239, 230) — light cream

function createIcon(size) {
  const bgR = 29, bgG = 26, bgB = 21
  const acR = 216, acG = 92, acB = 50
  const fgR = 244, fgG = 239, fgB = 230

  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.35
  const innerR = size * 0.15
  const cornerR = size * 0.22 // rounded corner radius for background

  return makeRoundedPNG(size, size, cornerR, (x, y) => {
    const dx = x - cx
    const dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist <= innerR) return [fgR, fgG, fgB]
    if (dist <= outerR) return [acR, acG, acB]
    return [bgR, bgG, bgB]
  })
}

function makeRoundedPNG(width, height, cornerR, getPixel) {
  const bgR = 29, bgG = 26, bgB = 21

  return makePNG(width, height, (x, y) => {
    // Check if pixel is inside rounded rectangle
    const inRounded = isInsideRoundedRect(x, y, width, height, cornerR)
    if (!inRounded) return [bgR, bgG, bgB] // transparent -> bg color (PNG background)
    return getPixel(x, y)
  })
}

function isInsideRoundedRect(x, y, w, h, r) {
  // Check corners
  if (x < r && y < r) return dist(x, y, r, r) <= r
  if (x > w - r && y < r) return dist(x, y, w - r, r) <= r
  if (x < r && y > h - r) return dist(x, y, r, h - r) <= r
  if (x > w - r && y > h - r) return dist(x, y, w - r, h - r) <= r
  return true
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

// ─── Generate all icons ───────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true })

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of sizes) {
  const png = createIcon(size)
  writeFileSync(join(OUT_DIR, name), png)
  console.log(`Created ${name} (${size}x${size}, ${png.length} bytes)`)
}

console.log('Icons generated successfully!')
