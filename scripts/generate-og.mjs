// Generates the static branded OpenGraph card → public/og/default.png
// Run once with: node scripts/generate-og.mjs  (uses sharp, no WASM/edge).
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="glow" cx="18%" cy="0%" r="60%">
      <stop offset="0%" stop-color="#FF5A1F" stop-opacity="0.40"/>
      <stop offset="60%" stop-color="#FF5A1F" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF7A3C"/><stop offset="100%" stop-color="#E0360A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0A0B"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(72,84)">
    <rect width="56" height="56" rx="14" fill="url(#mark)"/>
    <text x="76" y="38" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700" fill="#F5F5F7">W3<tspan fill="#FF7A3C">Codify</tspan></text>
  </g>
  <text x="72" y="330" font-family="Arial,Helvetica,sans-serif" font-size="62" font-weight="800" fill="#F5F5F7">Become the software engineer</text>
  <text x="72" y="404" font-family="Arial,Helvetica,sans-serif" font-size="62" font-weight="800" fill="#F5F5F7"><tspan fill="#FF5A1F">companies</tspan> want to hire.</text>
  <text x="72" y="464" font-family="Arial,Helvetica,sans-serif" font-size="30" fill="#A1A1AA">Live cohorts &#183; Real projects &#183; An AI mentor 24/7</text>
  <text x="72" y="556" font-family="Arial,Helvetica,sans-serif" font-size="24" fill="#8B8B94">1M+ learners      92% placement      Learn. Build. Get Placed.</text>
</svg>`;

mkdirSync("public/og", { recursive: true });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync("public/og/default.png", png);
console.log("wrote public/og/default.png", png.length, "bytes");
