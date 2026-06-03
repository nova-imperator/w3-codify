# W3Codify — Image Prompt Pack (Photoreal) · for Google Whisk / Imagen / Nano-Banana

> **Goal:** every image must look **real** — shot on a real camera or rendered as a
> high-end ray-traced 3D product shot — **not** like AI glow-art. Brand stays dark +
> molten-orange, but expressed as *real light and real materials*. The heart of the pack
> is **§E in-lesson study art**: photoreal 3D renders of concepts students love to study.

---

## 0. Realism Doctrine (read once — this is why the last version looked fake)

The old prompts said "glowing energy concept." That *creates* the AI look. Instead we
describe **a real photograph or a real physical/3D render**, with camera, lens, Kelvin
lighting, PBR materials, and **explicit anti-AI rules** — exactly like the reference prompt
you shared (iPhone, scene, pose, lighting, strict realism rules).

### Two render modes
- **PHOTO mode** (people, scenes, mascot, classroom, about): a genuine camera shot.
  Devices: *iPhone 17 Pro Max* (candid) or *Sony A7 IV + 85mm f/1.8* (portrait/studio).
- **RENDER mode** (concepts, tech objects, tiers, icons): **photorealistic 3D product
  render** — *Octane / Unreal Engine 5, ray-traced reflections, global illumination,
  physically-based materials, studio softbox lighting, macro detail* — the look of an
  Apple-keynote graphic or a real photographed physical model. Real, not illustrated.

### Reusable suffixes — append to every prompt
**PHOTO REALISM SUFFIX:**
> *"— 8K hyper-realistic photograph, true-to-life color, natural skin texture and real
> fabric/material detail, real shadows and highlights, natural contrast only. No AI-art
> style, no plastic skin, no exaggerated depth-of-field, no HDR glow, no oversaturation,
> no extra fingers or artifacts, no text, no words, no logos. Must look like a genuine
> real-world photograph."*

**RENDER REALISM SUFFIX:**
> *"— photorealistic 3D product render, Octane/Unreal Engine 5, ray-traced reflections and
> soft contact shadows, physically-based materials (brushed metal, matte plastic, glass,
> concrete), shot like premium studio product photography on a dark set, 8K, ultra-detailed,
> natural contrast. No AI-art style, no cartoon glow, no plastic look, no oversaturation,
> no HDR, no text, no words, no logos. Must look like a real photographed object."*

### Brand palette as REAL light (not neon) — "Indigo & Cyan"
> ⚠️ **GLOBAL OVERRIDE — the brand is now Indigo & Cyan, NOT orange.** Every prompt below
> still says "orange" in places; **read every "orange" as our accent light instead:** a
> **cool cyan‑to‑indigo gel** — cyan `#22D3EE` and indigo‑violet `#6D5EF6`. So "orange rim
> light" → "cyan/indigo rim light", "warm orange lamp" → "cool indigo practical light", etc.

- Set/background: real near-black **indigo** studio (`#0A0B14`–`#14162B`), seamless or textured concrete.
- Accent: a **real cool light source** — a **cyan/indigo‑gelled** strobe or LED panel
  used as a **rim/edge light** against a neutral key (~5200K). The accent shows up as genuine
  reflections and glints on metal/glass, **not** as a painted glow.
- Use the accent sparingly: one cyan/indigo accent light, real bounce, real specular highlights.

### Structured prompt template (use these fields, like your reference)
```
Scene: ...
Subject: ...            (course cards: "use 100% of the uploaded face; do NOT modify facial
                         structure, hairstyle, beard, or skin tone")
Pose / Composition: ...
Materials / Outfit: ...
Camera: device + lens + distance + angle
Lighting: Kelvin + direction + quality (hard/soft)
Background: ...
Detail preservation: ...
Color & contrast rules: ...
Realism rules: <PHOTO or RENDER suffix>
Aspect: ...
```

### Whisk tips
- **PHOTO mode (course cards):** Subject input = instructor photo; Style input = a real
  reference photo with the dark+orange lighting you like. Keep "use 100% of the face".
- **RENDER mode:** leave Subject empty; once you get one render you love, use it as the
  Style input for the rest so all concept art matches.
- Generate 3–4 variants, keep the most realistic (reject any with a "drawn"/glow look).

---

## A. Course Card Thumbnails (3) — PHOTO mode · **Aspect 16:9 (1280×720)**
Real studio portrait of the instructor with a real environment hinting the topic.

### A1 — Machine Learning & Deep Learning
```
Scene: a real dark studio / modern office at night, seamless charcoal backdrop.
Subject: the instructor from the uploaded photo — use 100% of the face, do NOT modify
  facial structure, hairstyle, beard, or skin tone. Confident, friendly.
Pose/Composition: seated or standing at right third, body angled to camera, arms relaxed.
Materials/Outfit: dark fitted hoodie or tee, real fabric weave visible.
Camera: Sony A7 IV, 85mm f/1.8, ~1.5 m, slightly above eye level.
Lighting: neutral 5200K softbox key from front-left; an orange-gelled rim light (~3000K)
  from back-right creating a real warm edge on hair and shoulder.
Background: a large out-of-focus real monitor far behind showing faint blue/orange data
  charts (real screen glow, not a graphic overlay); subtle haze.
Detail preservation: skin pores, stubble, fabric texture, catchlights in the eyes.
Color & contrast: natural; orange only as real rim light + screen reflection.
Realism rules: PHOTO REALISM SUFFIX.
Aspect: 16:9.
```

### A2 — Cloud Computing
```
Same Subject / Camera / Lighting / Realism as A1.
Background: a real data-center cold-aisle far behind, server racks with tiny status LEDs
  softly out of focus, a couple of warm orange indicator lights; real depth, real bokeh.
Outfit: dark hoodie. Optional real prop: hand resting near a laptop on a desk edge.
Aspect: 16:9.
```

### A3 — Cyber Security
```
Same Subject / Camera / Lighting / Realism as A1.
Background: a real dark SOC / desk with multiple monitors out of focus showing faint
  terminal-green and orange glow; moody, controlled. Real screen light on the face.
Mood: focused, sharp. Outfit: dark hoodie.
Aspect: 16:9.
```
> Keep all three identical in framing/lighting so the Courses grid looks like one shoot.

---

## B. Tier Emblems (Basics / Advanced / GOD) — RENDER mode · **Aspect 1:1 (1024²)**
Real photographed physical objects on a dark set (reusable on roadmap/badges).

- **B1 Basics:** *a single small machined metal cube resting on dark concrete, one warm
  orange edge-light catching a chamfer, calm and minimal, macro.* RENDER SUFFIX.
- **B2 Advanced:** *three interlocking brushed-metal geometric forms stacked into an
  ascending structure, real reflections, one orange rim light, premium product shot.* RENDER SUFFIX.
- **B3 GOD:** *a single flawless polished object (faceted metal or obsidian) on a pedestal under
  a dramatic spotlight, intense real orange specular highlights, hero product photography.* RENDER SUFFIX.

---

## C. Homepage Section Images
### C1 — Hero background · PHOTO mode · **16:9 + 21:9, 1920px+**
```
Scene: a real dark modern developer workspace at night — a wide desk, a large monitor
  glowing softly, a warm orange desk lamp (practical light) off to one side, faint city
  bokeh through a window.
Composition: shot wide with LOTS of empty dark negative space on the left for headline text.
Camera: Sony A7 IV, 24mm, moderate aperture for gentle real depth (not heavy blur).
Lighting: monitor glow + 3000K orange lamp as the only warm accent; 5200K ambient fill.
Realism rules: PHOTO REALISM SUFFIX. Aspect: 16:9 and 21:9.
```
### C2 — AI Tutor teaser · RENDER mode · **4:3 or 1:1**
```
A real photographed matte-white-and-orange desktop robot/assistant device on a dark desk,
small, friendly, premium industrial design (Teenage Engineering / Apple vibe), a soft warm
LED ring, sitting beside a real glowing phone or tablet. Studio product photography, shallow
real depth. RENDER REALISM SUFFIX.
```
### C3 — Feature motifs · RENDER mode · **1:1, set of 6**
*Real photographed minimalist metal/glass desk objects on dark concrete, each a single icon-like
form (a small broadcast antenna, a glass lightbulb, a metal rocket, two clasped metal hands, a
node-cluster sculpture, a small trophy), one orange rim light, consistent macro product shots.* RENDER SUFFIX.
### C4 — Roadmap backdrop · RENDER mode · **16:9**
*A real long machined path/rail on dark terrain receding to a brighter peak, small metal milestone
markers along it catching orange light; tilt-shift product-photography feel.* RENDER SUFFIX.
### C5 — Outcomes backdrop · RENDER mode · **16:9**
*Real frosted-glass and metal bar forms rising like a growth chart on a dark reflective surface,
warm orange edge light, premium and clean, space to overlay logos.* RENDER SUFFIX.
### C6 — CTA band · PHOTO/RENDER · **16:9 wide**
*A real dark surface raked by a single warm orange light from one side, soft real gradient of light
to shadow, lots of clean central space; like a photographed studio backdrop.* PHOTO SUFFIX.
### C7 — Testimonials texture · RENDER · **16:9 seamless**
*Very subtle real dark carbon/concrete texture with faint orange specular flecks, low contrast,
sits behind cards without distracting.* RENDER SUFFIX.

---

## E. In-Lesson Study Art ⭐ — RENDER mode (photoreal) · **16:9 or 4:3**
The magnet. Each concept = a **real photographed physical model / ray-traced 3D render**, so it
looks tangible, not drawn. Text-free (labels overlaid in UI). RENDER REALISM SUFFIX on all.

### E1 — Machine Learning & Deep Learning
- **Gradient descent:** *a polished chrome ball-bearing resting at the bottom of a smooth,
  undulating matte-black valley surface; real ray-traced reflections, orange contour rim light
  raking across the terrain; macro studio shot.*
- **Neural network:** *a real physical sculpture of small metal spheres connected by thin
  taut steel wires in ordered layers on a dark set, shallow depth, one orange edge light catching
  the wires.*
- **Backpropagation:** *the same wired-sphere sculpture lit so a warm orange light sweeps from
  right to left, real reflections traveling backward along the wires; macro.*
- **CNN (vision):** *stacked panes of real frosted glass in a row on a dark surface, an image
  reflection sharpening pane by pane, ray-traced, product-photography depth.*
- **Transformer attention:** *a cluster of glass orbs on a dark reflective table connected by
  thin fiber-optic strands of warm light of varying brightness; real macro photography.*
- **Overfitting vs generalization:** *two real bent metal wires over a field of small ball
  bearings on dark felt — one wire kinks through every ball, one curves smoothly; top-down studio shot.*

### E2 — Cloud Computing
- **Regions & AZs:** *real dark scale-model islands of circuitry on a black table linked by thin
  glowing fiber-optic bridges; tilt-shift macro, warm orange node lights.*
- **Load balancer:** *a real machined metal manifold splitting one inflow tube into several even
  outflow tubes, fluid-of-light done with real fiber optics; studio macro.*
- **Containers & Kubernetes:** *real miniature metal shipping containers neatly stacked on a dark
  dock, a small control-tower model overlooking them, one warm light; product photography.*
- **Auto-scaling:** *a modular metal tower model gaining and losing stacked blocks, photographed as
  a real desktop model under studio light.*
- **CDN / edge:** *a real dark globe model with tiny orange LED points lighting up around its
  surface near miniature figures; macro, ray-traced.*
- **Serverless:** *small brushed-metal cubes appearing on a dark reflective surface lit by brief
  warm sparks of real light; high-end product shot.*

### E3 — Cyber Security
- **Defense in depth:** *concentric real metal ring-walls around a small glowing core on a dark
  set, each ring a machined barrier, one orange spotlight; macro product photography.*
- **Encryption:** *a real heavy metal vault/lock with a clear acrylic message-card going in one
  side and a scrambled etched-glass card coming out the other; studio macro.*
- **SQL injection:** *a real skeleton key inserted into a server-shaped metal lock with fine
  hairline cracks, dramatic single orange light, tense mood; macro.*
- **Man-in-the-middle:** *a real envelope of fiber-optic light passing between two metal busts
  on a dark table, intercepted mid-way by a third shadowed form; cinematic product shot.*
- **Firewall:** *a real wall of vertical heated metal bars on a dark set with small particles
  passing through gaps, warm orange glow from the bars' edges; macro.*
- **Phishing:** *a real fishing hook holding a small glowing lure descending into dark water with
  faint reflective fish; moody macro product photography.*

> Manager note: generate per concept, 16:9, **text-free, photoreal**. If any comes out looking
> drawn/cartoon, regenerate with "real photographed physical model, macro studio product
> photography" pushed harder and "no illustration, no cartoon, no glow" added.

---

## F. Page & App Delight — mixed modes
- **F1 About/team (PHOTO, 16:9):** *real candid photo of a focused young dev team in a warm-lit
  dark studio, natural expressions.* PHOTO SUFFIX.
- **F2 Empty: no enrollments (RENDER, 4:3):** *a real friendly matte-white desktop robot holding a
  blank hardcover book on a dark desk, warm key light, product photography.* RENDER SUFFIX.
- **F3 Empty: no projects (RENDER, 4:3):** *the same robot at a tiny real workbench with real
  miniature tools, inviting.* RENDER SUFFIX.
- **F4 404 (RENDER, 16:9):** *the same robot standing on a small dark model-planet holding a paper
  map, charming, studio-lit.* RENDER SUFFIX.
- **F5 Loading (RENDER, 1:1):** *a single brushed-metal ring/gyroscope on a dark set catching one
  orange highlight, clean macro.* RENDER SUFFIX.
- **F6 Achievement badges (RENDER, 1:1 set):** *real machined metal medallions on dark felt — a
  flame (streak), a checkmark (complete), a crown (GOD tier), a rocket (first project) — each
  with a warm orange edge light, hero product photography.* RENDER SUFFIX.
- **F7 Certificate bg (RENDER, landscape A4):** *a real dark textured paper/leather certificate
  surface with a subtle embossed orange wax seal in a corner, lots of clean space.* RENDER SUFFIX.
- **F8 Profile banner (PHOTO/RENDER, 4:1 wide):** *a real subtle dark desk surface raked by soft
  warm light, low contrast, room for avatar/name.* PHOTO SUFFIX.
- **F9 Classroom welcome (PHOTO, 16:9):** *a real cozy dark study desk with a glowing monitor and
  warm lamp, inviting "your learning space" feel, gentle real depth.* PHOTO SUFFIX.

---

## D. Brand / Social
- **D1 — OG / social share image (1200×630):** *a real dark studio product shot of a few machined
  metal objects (a chip, a lock, a small cloud sculpture) arranged cleanly with one orange edge
  light, lots of central space for a title overlay.* RENDER SUFFIX.
- **D2 — App icon base (1:1):** *a single real machined-metal monogram object on dark concrete with
  a warm orange highlight, minimal, iconic; the only stylized mark, no other text.* RENDER SUFFIX.

---

## Manager checklist (how I'd run this with you)
1. **A1–A3** course cards (PHOTO, instructor photo + "use 100% of the face").
2. **C1 hero** + **C2 AI-tutor device** — highest-impact homepage shots.
3. **§E study art** — 2–3 concepts per course first (ML: gradient descent + neural net +
   attention). These are the magnet; insist on the photoreal "real physical model" look.
4. **B tiers** + **C3–C7** + **§F delight** to finish.
5. Send me the files/paths; I'll wire each in and flag any that still look AI-drawn for a re-gen.
6. Naming convention (build auto-picks these up):
   - Cards: `public/images/courses/ml-dl.png`, `cloud.png`, `cyber.png`
   - **Lesson art:** `public/images/lessons/ml/gradient-descent.png`, `neural-net.png`,
     `attention.png`, … `lessons/cloud/…`, `lessons/cyber/…`
   - Home: `public/images/home/hero.png`, `ai-tutor.png`, `roadmap.png`, `outcomes.png`, `cta.png`
   - Tiers: `public/images/tiers/basics.png`, `advanced.png`, `god.png`
   - Delight: `public/images/app/mascot-empty.png`, `404.png`, `badge-streak.png`, …
   - Social: `public/og/default.png`

> **The realism rule that fixes everything:** describe a **real photo or a real photographed
> 3D/physical model** with a real camera + Kelvin lighting + PBR materials, and end with the
> anti-AI suffix. Never say "glowing energy / concept art" — that wording is what makes it
> look fake. It's a repeatable factory: every new admin-added course gets a card + photoreal
> concept set using these exact rules.
