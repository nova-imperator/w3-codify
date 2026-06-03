/**
 * Generates every lesson's study image (PNG) and downloadable notes doc (.md)
 * from the single content source in prisma/content.ts, so the seeded block
 * URLs always have real files behind them.
 *
 *   pnpm tsx scripts/generate-lesson-assets.mts
 *
 * Outputs:
 *   public/images/lessons/<courseSlug>/<lessonSlug>.png   (branded 16:9 study card)
 *   public/docs/<courseSlug>/<lessonSlug>.md              (notes + quiz recap)
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { COURSES } from "../prisma/content.ts";

const TIER_COLOR: Record<string, string> = {
  Basics: "#22D3EE",
  Advanced: "#8B7DFF",
  GOD: "#F5A623",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Naive word-wrap to a max chars-per-line, returns up to maxLines lines. */
function wrap(text: string, perLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > perLine) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && cur) lines.push(cur.trim());
  return lines.slice(0, maxLines);
}

function studyCardSvg(courseTitle: string, tier: string, lessonTitle: string, caption: string): string {
  const accent = TIER_COLOR[tier] ?? "#8B7DFF";
  const titleLines = wrap(lessonTitle, 26, 3);
  const titleSvg = titleLines
    .map(
      (ln, i) =>
        `<text x="80" y="${300 + i * 78}" font-family="Arial,Helvetica,sans-serif" font-size="66" font-weight="800" fill="#EDEEF7">${esc(
          ln,
        )}</text>`,
    )
    .join("\n  ");
  const capLines = wrap(caption, 56, 2);
  const capSvg = capLines
    .map(
      (ln, i) =>
        `<text x="80" y="${300 + titleLines.length * 78 + 36 + i * 36}" font-family="Arial,Helvetica,sans-serif" font-size="28" fill="#9AA0C0">${esc(
          ln,
        )}</text>`,
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
  <defs>
    <radialGradient id="g1" cx="14%" cy="0%" r="65%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.40"/>
      <stop offset="60%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="100%" cy="100%" r="55%">
      <stop offset="0%" stop-color="#6D5EF6" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="#6D5EF6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8B7DFF"/><stop offset="55%" stop-color="#6D5EF6"/><stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="#0A0B14"/>
  <rect width="1200" height="675" fill="url(#g1)"/>
  <rect width="1200" height="675" fill="url(#g2)"/>
  <g transform="translate(80,84)">
    <rect width="48" height="48" rx="12" fill="url(#mark)"/>
    <text x="64" y="33" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" fill="#EDEEF7">W3<tspan fill="#8B7DFF">Codify</tspan></text>
  </g>
  <g transform="translate(80,150)">
    <rect width="${110 + tier.length * 10}" height="40" rx="20" fill="${accent}" fill-opacity="0.16" stroke="${accent}" stroke-opacity="0.5"/>
    <text x="22" y="27" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700" fill="${accent}">${esc(
      tier.toUpperCase(),
    )} TIER</text>
  </g>
  <text x="80" y="228" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="600" fill="#7A80A8">${esc(
    courseTitle,
  )}</text>
  ${titleSvg}
  ${capSvg}
  <rect x="80" y="612" width="1040" height="3" rx="1.5" fill="url(#mark)"/>
</svg>`;
}

/** Strip markdown to readable plain text for the notes doc. */
function stripMd(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "• ");
}

let images = 0;
let docs = 0;

for (const course of COURSES) {
  for (const section of course.sections) {
    const tier = section.tier ?? "Basics";
    for (const lesson of section.lessons) {
      const imgDir = `public/images/lessons/${course.slug}`;
      const docDir = `public/docs/${course.slug}`;
      mkdirSync(imgDir, { recursive: true });
      mkdirSync(docDir, { recursive: true });

      // Study image
      const svg = studyCardSvg(course.title, tier, lesson.title, lesson.image.caption);
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      writeFileSync(`${imgDir}/${lesson.slug}.png`, png);
      images++;

      // Notes doc
      const quizRecap = lesson.quizzes
        .map(
          (q, i) =>
            `${i + 1}. **${q.question}**\n   - Answer: ${q.options[q.answer]}\n   - Why: ${q.why}`,
        )
        .join("\n\n");
      const codeBlock = lesson.code
        ? `\n## Code\n\n\`\`\`${lesson.code.lang}\n${lesson.code.code}\n\`\`\`\n`
        : "";
      const calloutBlock = lesson.callout ? `\n> ${stripMd(lesson.callout.md)}\n` : "";
      const doc = `# ${lesson.title}

**${course.title}** · ${tier} tier · downloadable study notes

---

${stripMd(lesson.text)}
${codeBlock}${calloutBlock}
## Study image

${lesson.image.caption}

## Checkpoint recap

${quizRecap}

---

© W3Codify — free during launch. Generated study notes.
`;
      writeFileSync(`${docDir}/${lesson.slug}.md`, doc, "utf8");
      docs++;
    }
  }
}

console.log(`✓ generated ${images} study images and ${docs} notes docs`);
