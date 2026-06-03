// Generates brand icons (favicon, apple-touch, PWA 192/512) from one SVG mark.
// Run with: node scripts/generate-icons.mjs
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";

// Rounded molten-orange tile with a code-bracket mark, on the brand canvas.
function markSvg(size) {
  const r = Math.round(size * 0.22);
  const s = size;
  const sw = Math.max(2, Math.round(size * 0.06));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8B7DFF"/><stop offset="50%" stop-color="#6D5EF6"/><stop offset="100%" stop-color="#22D3EE"/>
      </linearGradient>
    </defs>
    <rect width="${s}" height="${s}" rx="${r}" fill="url(#g)"/>
    <g fill="none" stroke="#fff" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"
       transform="translate(${s * 0.5}, ${s * 0.5})">
      <path d="M ${-s * 0.16} ${-s * 0.12} L ${-s * 0.26} 0 L ${-s * 0.16} ${s * 0.12}"/>
      <path d="M ${s * 0.16} ${-s * 0.12} L ${s * 0.26} 0 L ${s * 0.16} ${s * 0.12}"/>
      <path d="M ${s * 0.04} ${-s * 0.16} L ${-s * 0.04} ${s * 0.16}"/>
    </g>
  </svg>`;
}

async function png(size) {
  return sharp(Buffer.from(markSvg(size))).png().toBuffer();
}

mkdirSync("public", { recursive: true });
mkdirSync("src/app", { recursive: true });

// PWA icons (public/)
writeFileSync("public/icon-192.png", await png(192));
writeFileSync("public/icon-512.png", await png(512));
// Next file conventions (app/) → favicon + apple touch
writeFileSync("src/app/icon.png", await png(64));
writeFileSync("src/app/apple-icon.png", await png(180));

// favicon.ico — wrap a 48px PNG in a minimal ICO container (fixes /favicon.ico 404).
const fav = await png(48);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type = icon
header.writeUInt16LE(1, 4); // image count
const entry = Buffer.alloc(16);
entry.writeUInt8(48, 0); // width
entry.writeUInt8(48, 1); // height
entry.writeUInt8(0, 2); // palette
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // color planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(fav.length, 8); // size of PNG data
entry.writeUInt32LE(22, 12); // offset (6 + 16)
writeFileSync("src/app/favicon.ico", Buffer.concat([header, entry, fav]));

console.log("icons written: public/icon-192.png, public/icon-512.png, src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico");
