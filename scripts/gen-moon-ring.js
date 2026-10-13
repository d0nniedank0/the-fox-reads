/* Moon-phase ring: generate the SVG, render it with a real renderer,
   and measure the lit fraction of every phase from actual pixels.
   Run: node scripts/gen-moon-ring.js
   Outputs: assets/moon-ring.png (ring alone), assets/moon-ring-on-card.png (how it reads on the card back) */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const r = 5.2;          // phase disc radius
const RING_R = 26;      // phase centers sit this far from the ring center
const C = 50;           // viewBox center
/* NOTE: must return a NUMBER, not a string — these values get re-used in
   arithmetic (cy + r). A string would concatenate instead of adding. */
const f = (v) => Math.round(v * 100) / 100;

function centerOf(k) {
  const a = (-90 + k * 45) * Math.PI / 180;
  return [f(C + RING_R * Math.cos(a)), f(C + RING_R * Math.sin(a))];
}

/* Two-arc phase shapes.
   outer: semicircle (sweep 1 = right side, 0 = left side)
   inner: same sweep → bulges the other way (gibbous); opposite sweep → crescent */
function crescent(cx, cy, rx, side) {
  const T = [cx, f(cy - r)], B = [cx, f(cy + r)];
  const os = side === "right" ? 1 : 0, is = side === "right" ? 0 : 1;
  return `M ${T[0]},${T[1]} A ${f(r)},${f(r)} 0 0 ${os} ${B[0]},${B[1]} A ${f(rx)},${f(r)} 0 0 ${is} ${T[0]},${T[1]} Z`;
}
function quarter(cx, cy, side) {
  const T = [cx, f(cy - r)], B = [cx, f(cy + r)];
  const s = side === "right" ? 1 : 0;
  return `M ${T[0]},${T[1]} A ${f(r)},${f(r)} 0 0 ${s} ${B[0]},${B[1]} Z`;
}
function gibbous(cx, cy, rx, side) {
  const T = [cx, f(cy - r)], B = [cx, f(cy + r)];
  const s = side === "right" ? 1 : 0;
  return `M ${T[0]},${T[1]} A ${f(r)},${f(r)} 0 0 ${s} ${B[0]},${B[1]} A ${f(rx)},${f(r)} 0 0 ${s} ${T[0]},${T[1]} Z`;
}

const INK = "#25236b";

const PHASES = [
  { k: 0, name: "new",        kind: "outline" },
  { k: 1, name: "wax-cres",   kind: "crescent", rx: 2.2, side: "right" },
  { k: 2, name: "first-q",    kind: "quarter",  side: "right" },
  { k: 3, name: "wax-gibb",   kind: "gibbous",  rx: 2.9, side: "right" },
  { k: 4, name: "full",       kind: "full" },
  { k: 5, name: "wan-gibb",   kind: "gibbous",  rx: 2.9, side: "left" },
  { k: 6, name: "last-q",     kind: "quarter",  side: "left" },
  { k: 7, name: "wan-cres",   kind: "crescent", rx: 2.2, side: "left" },
];

const shapes = PHASES.map((p) => {
  const [cx, cy] = centerOf(p.k);
  let node;
  if (p.kind === "outline") {
    node = `<circle cx="${cx}" cy="${cy}" r="${f(r)}" fill="none" stroke="${INK}" stroke-width="1.1"/>`;
  } else if (p.kind === "full") {
    node = `<circle cx="${cx}" cy="${cy}" r="${f(r)}" fill="${INK}"/>`;
  } else {
    const d = p.kind === "crescent" ? crescent(cx, cy, p.rx, p.side)
            : p.kind === "quarter"  ? quarter(cx, cy, p.side)
            :                         gibbous(cx, cy, p.rx, p.side);
    node = `<path d="${d}" fill="${INK}"/>`;
  }
  return { ...p, cx, cy, node };
});

const ringGroup =
  `<circle cx="${C}" cy="${C}" r="38" fill="none" stroke="${INK}" stroke-width="1.1" opacity="0.85"/>` +
  shapes.map((s) => s.node).join("") +
  `<circle cx="${C}" cy="${C}" r="2" fill="${INK}" opacity="0.8"/>`;

const svgAlone =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1000" height="1000">${ringGroup}</svg>`;

const CARD_W = 190, CARD_H = 300, SCALE = 4;
const svgOnCard =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W * SCALE}" height="${CARD_H * SCALE}" ` +
  `viewBox="0 0 ${CARD_W} ${CARD_H}">` +
    `<defs><linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#f6efe0"/><stop offset="1" stop-color="#e8dfca"/>` +
    `</linearGradient></defs>` +
    `<rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" rx="10" fill="url(#paper)" ` +
      `stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>` +
    `<rect x="9" y="9" width="${CARD_W - 18}" height="${CARD_H - 18}" rx="6" fill="none" ` +
      `stroke="${INK}" stroke-opacity="0.22" stroke-width="0.7"/>` +
    `<g transform="translate(${(CARD_W - 100) / 2}, ${(CARD_H - 100) / 2}) scale(${118 / 100})">` +
      ringGroup +
    `</g>` +
  `</svg>`;

const OUT = path.join(__dirname, "..", "assets");

(async () => {
  // render for humans to look at
  fs.writeFileSync(path.join(OUT, "moon-ring.png"),
    await sharp(Buffer.from(svgAlone)).png().toBuffer());
  fs.writeFileSync(path.join(OUT, "moon-ring-on-card.png"),
    await sharp(Buffer.from(svgOnCard)).png().toBuffer());

  // render raw for pixel measurement (ring alone, flat cream bg so ink is unambiguous)
  const W = 1000;
  const measureSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${W}" height="${W}">` +
    `<rect width="100" height="100" fill="#f6efe0"/>${ringGroup}</svg>`;
  const { data, info } = await sharp(Buffer.from(measureSvg)).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels, px = W / 100;   // pixels per viewBox unit

  const isInk = (x, y) => {
    const i = (y * W + x) * ch;
    const R = data[i], G = data[i + 1], B = data[i + 2];
    // cream is ~246,239,224 → ink is far darker and bluer
    return (R + G + B) / 3 < 190;
  };

  console.log("phase        lit%   (sampled inside each 5.2-unit disc)\n");
  const results = [];
  const discR = r * px;
  for (const s of shapes) {
    const cxp = s.cx * px, cyp = s.cy * px;
    let ink = 0, total = 0;
    for (let y = Math.floor(cyp - discR); y <= Math.ceil(cyp + discR); y++) {
      for (let x = Math.floor(cxp - discR); x <= Math.ceil(cxp + discR); x++) {
        const dx = x - cxp, dy = y - cyp;
        if (dx * dx + dy * dy > discR * discR) continue;
        if (x < 0 || y < 0 || x >= W || y >= W) continue;
        total++;
        if (isInk(x, y)) ink++;
      }
    }
    const frac = ink / total;
    results.push({ name: s.name, frac });
    const bar = "#".repeat(Math.round(frac * 30));
    console.log(`${s.name.padEnd(12)} ${(frac * 100).toFixed(1).padStart(5)}%  ${bar}`);
  }

  const by = Object.fromEntries(results.map((r) => [r.name, r.frac]));
  const checks = [
    ["new is an outline ring",     by["new"] > 0.10 && by["new"] < 0.35],
    ["crescent is a thin sliver",  by["wax-cres"] > 0.18 && by["wax-cres"] < 0.42],
    ["first quarter is half lit",  Math.abs(by["first-q"] - 0.50) < 0.10],
    ["gibbous is mostly lit",      by["wax-gibb"] > 0.62 && by["wax-gibb"] < 0.92],
    ["full is fully lit",          by["full"] > 0.92],
    ["waning mirrors waxing",      Math.abs(by["wax-cres"] - by["wan-cres"]) < 0.03 &&
                                   Math.abs(by["wax-gibb"] - by["wan-gibb"]) < 0.03 &&
                                   Math.abs(by["first-q"] - by["last-q"]) < 0.03],
  ];
  console.log("");
  let allPass = true;
  for (const [label, pass] of checks) {
    if (!pass) allPass = false;
    console.log(`${pass ? "PASS" : "FAIL"}  ${label}`);
  }
  // standalone SVG (INK) and the exact inline markup (currentColor) for index.html
  const standalone =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">\n` +
    ringGroup.split("><").join(">\n  <").replace(/^/, "  <") + `\n</svg>\n`;
  fs.writeFileSync(path.join(OUT, "moon-ring.svg"), standalone);

  const inline =
    `<svg class="card-moon" viewBox="0 0 100 100" aria-hidden="true">\n` +
    "            " +
    `<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.85"/>` +
    shapes.map((s) => {
      if (s.kind === "outline") return `<circle cx="${s.cx}" cy="${s.cy}" r="5.2" fill="none" stroke="currentColor" stroke-width="1.1"/>`;
      if (s.kind === "full")    return `<circle cx="${s.cx}" cy="${s.cy}" r="5.2" fill="currentColor"/>`;
      const d = s.kind === "crescent" ? crescent(s.cx, s.cy, s.rx, s.side)
              : s.kind === "quarter"  ? quarter(s.cx, s.cy, s.side)
              :                         gibbous(s.cx, s.cy, s.rx, s.side);
      return `<path d="${d}" fill="currentColor"/>`;
    }).join("") +
    `<circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.8"/>` +
    `\n          </svg>`;
  fs.writeFileSync(path.join(OUT, "moon-ring.inline.txt"), inline);

  console.log("\nRESULT: " + (allPass ? "ring verified at pixel level" : "geometry wrong — do not ship"));
  console.log("wrote assets/moon-ring.png, assets/moon-ring-on-card.png, assets/moon-ring.svg, assets/moon-ring.inline.txt");
})().catch((e) => { console.error("render failed:", e); process.exit(1); });
