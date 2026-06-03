// Generates the static branded OpenGraph card → public/og/default.png
// Run once with: node scripts/generate-og.mjs  (uses sharp, no WASM/edge).
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="glow" cx="18%" cy="0%" r="60%">
      <stop offset="0%" stop-color="#6D5EF6" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#6D5EF6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="100%" cy="100%" r="55%">
      <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.20"/>
      <stop offset="60%" stop-color="#22D3EE" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8B7DFF"/><stop offset="55%" stop-color="#6D5EF6"/><stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0B14"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <g transform="translate(72,84)">
    <rect width="56" height="56" rx="14" fill="url(#mark)"/>
    <text x="76" y="38" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700" fill="#EDEEF7">W3<tspan fill="#8B7DFF">Codify</tspan></text>
  </g>
  <text x="72" y="330" font-family="Arial,Helvetica,sans-serif" font-size="62" font-weight="800" fill="#EDEEF7">Become the software engineer</text>
  <text x="72" y="404" font-family="Arial,Helvetica,sans-serif" font-size="62" font-weight="800" fill="#EDEEF7"><tspan fill="#22D3EE">companies</tspan> want to hire.</text>
  <text x="72" y="464" font-family="Arial,Helvetica,sans-serif" font-size="30" fill="#9AA0C0">Live cohorts &#183; Real projects &#183; An AI mentor 24/7</text>
  <text x="72" y="556" font-family="Arial,Helvetica,sans-serif" font-size="24" fill="#7A80A8">1M+ learners      92% placement      Learn. Build. Get Placed.</text>
</svg>`;

mkdirSync("public/og", { recursive: true });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync("public/og/default.png", png);
console.log("wrote public/og/default.png", png.length, "bytes");
