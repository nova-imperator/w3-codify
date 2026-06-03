// Generates the on-brand home CTA banner placeholder → public/images/home/cta-banner.png
// Run with: node scripts/generate-home-banner.mjs  (uses sharp, no WASM/edge).
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";

const W = 1600;
const H = 420;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6D5EF6"/>
      <stop offset="55%" stop-color="#5B4FE3"/>
      <stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="10%" r="70%">
      <stop offset="0%" stop-color="#8B7DFF" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="#8B7DFF" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g transform="translate(96,150)">
    <rect width="56" height="56" rx="14" fill="#FFFFFF" fill-opacity="0.16"/>
    <text x="76" y="38" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="800" fill="#FFFFFF">W3Codify</text>
  </g>
  <text x="96" y="270" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="600" fill="#FFFFFF" fill-opacity="0.92">Learn. Build. Get placed — completely free during launch.</text>
</svg>`;

mkdirSync("public/images/home", { recursive: true });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync("public/images/home/cta-banner.png", png);
console.log("wrote public/images/home/cta-banner.png", png.length, "bytes");
