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
        <stop offset="0%" stop-color="#FF7A3C"/><stop offset="50%" stop-color="#FF5A1F"/><stop offset="100%" stop-color="#E0360A"/>
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

console.log("icons written: public/icon-192.png, public/icon-512.png, src/app/icon.png, src/app/apple-icon.png");
