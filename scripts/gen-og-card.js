/* OG share card: 1200x630, built from the app's own art (fox plate + moon + type).
   Run: node scripts/gen-og-card.js
   Writes assets/og-card.png and verifies it (dimensions + that the type actually rendered). */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const W = 1200, H = 630;
const NIGHT = "#12111f";
const BONE = "#e7e2d7";
const BONE_DIM = "#a8a4b8";
const INDIGO = "#25236b";
const VERMILION = "#e04a2a";

const OUT = path.join(__dirname, "..", "assets");

/* ---------- 1. background: night ground, indigo wash, moon in the top-right ---------- */
const bg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="wash" cx="18%" cy="-10%" r="75%">
      <stop offset="0" stop-color="#7c82e6" stop-opacity="0.16"/>
      <stop offset="0.55" stop-color="#7c82e6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="deep" cx="88%" cy="108%" r="65%">
      <stop offset="0" stop-color="#25236b" stop-opacity="0.55"/>
      <stop offset="0.6" stop-color="#25236b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="moonG" cx="38%" cy="34%" r="72%">
      <stop offset="0" stop-color="#f2ecda"/>
      <stop offset="0.42" stop-color="#e8e2d0"/>
      <stop offset="0.78" stop-color="#cdc6ae"/>
      <stop offset="1" stop-color="#b8b096"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#e8e2d0" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#e8e2d0" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${NIGHT}"/>
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  <rect width="${W}" height="${H}" fill="url(#deep)"/>

  <!-- moon, mostly off the top-right corner, echoing the site -->
  <circle cx="1160" cy="-20" r="360" fill="url(#glow)"/>
  <circle cx="1160" cy="-20" r="250" fill="url(#moonG)" opacity="0.9"/>
  <circle cx="1064" cy="70" r="26" fill="#a09880" opacity="0.45"/>
  <circle cx="1120" cy="150" r="15" fill="#a09880" opacity="0.38"/>
  <circle cx="1010" cy="140" r="11" fill="#a09880" opacity="0.3"/>
</svg>`;

/* ---------- 2. type layer (measured below, so a font miss can't pass silently) ---------- */
const TEXT_X = 470, TITLE_Y = 300, TAG_Y = 356;
const textLayer = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <text x="${TEXT_X}" y="${TITLE_Y}" font-family="Georgia, 'Times New Roman', serif"
        font-size="82" font-weight="600" fill="${BONE}">The Fox Reads</text>
  <text x="${TEXT_X + 2}" y="${TAG_Y}" font-family="Georgia, 'Times New Roman', serif"
        font-size="31" fill="${BONE_DIM}">A fox reads your cards for you.</text>
  <text x="${TEXT_X + 2}" y="${TAG_Y + 42}" font-family="Georgia, 'Times New Roman', serif"
        font-size="31" fill="${BONE_DIM}">Ask a real question. Shuffle it yourself.</text>
  <rect x="${TEXT_X + 2}" y="${TAG_Y + 74}" width="86" height="4" rx="2" fill="${VERMILION}"/>
</svg>`;

(async () => {
  const bgPng = await sharp(Buffer.from(bg)).png().toBuffer();

  /* fox plate: cream artwork, rounded + shadowed so it reads as a hung print, not a pasted photo */
  const plateH = 470;
  const foxSrc = path.join(OUT, "fox-paper.png");
  const meta = await sharp(foxSrc).metadata();
  const plateW = Math.round(plateH * (meta.width / meta.height));

  const roundMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${plateW}" height="${plateH}">` +
    `<rect width="${plateW}" height="${plateH}" rx="8" fill="#fff"/></svg>`);

  const plate = await sharp(foxSrc)
    .resize(plateW, plateH, { fit: "cover" })
    .composite([{ input: roundMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const plateLeft = 92;
  const plateTop = Math.round((H - plateH) / 2);

  const base = sharp(bgPng)
    .composite([
      { input: plate, left: plateLeft, top: plateTop },
      { input: Buffer.from(textLayer), left: 0, top: 0 },
    ])
    .png();

  const outPng = await base.toBuffer();
  fs.writeFileSync(path.join(OUT, "og-card.png"), outPng);

  /* ---------- verification: dimensions + the type actually rendered ---------- */
  const md = await sharp(outPng).metadata();
  const { data, info } = await sharp(outPng).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  function lightFraction(x0, y0, x1, y1, thresh) {
    let hit = 0, tot = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * info.width + x) * ch;
        tot++;
        if ((data[i] + data[i + 1] + data[i + 2]) / 3 > thresh) hit++;
      }
    }
    return hit / tot;
  }

  const titleInk = lightFraction(TEXT_X, TITLE_Y - 80, 1150, TITLE_Y + 12, 150);
  const tagInk   = lightFraction(TEXT_X, TAG_Y - 26, 1150, TAG_Y + 58, 130);
  const plateInk = lightFraction(plateLeft + 20, plateTop + 20, plateLeft + plateW - 20, plateTop + plateH - 20, 150);

  console.log(`dimensions        : ${md.width}x${md.height}  ${md.width === W && md.height === H ? "PASS" : "FAIL (want " + W + "x" + H + ")"}`);
  console.log(`title glyphs      : ${(titleInk * 100).toFixed(2)}% ink  ${titleInk > 0.02 ? "PASS (type rendered)" : "FAIL (font missed — text is invisible)"}`);
  console.log(`tagline glyphs    : ${(tagInk * 100).toFixed(2)}% ink  ${tagInk > 0.01 ? "PASS" : "FAIL"}`);
  console.log(`fox plate present : ${(plateInk * 100).toFixed(1)}% light  ${plateInk > 0.3 ? "PASS" : "FAIL"}`);
  console.log(`bytes             : ${(outPng.length / 1024).toFixed(0)} KB`);

  const ok = md.width === W && md.height === H && titleInk > 0.02 && tagInk > 0.01 && plateInk > 0.3;
  console.log("\nRESULT: " + (ok ? "og-card verified" : "og-card FAILED verification — do not ship"));
  if (!ok) process.exit(1);
})().catch((e) => { console.error("og-card generation failed:", e); process.exit(1); });
