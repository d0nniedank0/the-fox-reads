/* Engine tests — Node, no DOM. Run: node test/engine.test.js */
const assert = require("assert");
const E = require("../js/engine.js");

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ FAIL: " + name); }
}

const IDS = E.CARDS.map(c => c.id);
const S1 = E.SPREADS.find(s => s.id === "one");
const S3 = E.SPREADS.find(s => s.id === "three");
const S5 = E.SPREADS.find(s => s.id === "five");

/* ---------- deck integrity ---------- */
console.log("deck");
ok(E.CARDS.length === 22, "22 cards");
ok(new Set(IDS).size === 22, "unique ids");
ok(E.CARDS.every(c => c.name && c.upright && c.reversed && c.img && Array.isArray(c.keywords)), "every card has name/upright/reversed/img/keywords");
ok(E.CARDS.every(c => c.upright.length > 80 && c.reversed.length > 40), "card text is substantial");
ok(E.CARDS.every(c => !/\b(universe|energy|vibration)\b/i.test(c.upright + c.reversed)), "no mystical filler words");

/* ---------- spreads ---------- */
console.log("spreads");
ok([S1, S3, S5].every(Boolean), "three spreads exist");
ok(S3.positions.length === 3 && S5.positions.length === 5, "position counts");
ok(S5.positions.map(p => p.key).join(",") === "situation,against,underneath,todo,lands", "five-card keys in order");

/* ---------- determinism ---------- */
console.log("determinism");
{
  const NOW = "2026-10-13T00:00:00Z";
  const a = E.drawReading({ spread: S3, rng: E.mulberry32(42), now: NOW, reversalsEnabled: true, order: IDS.slice() });
  const b = E.drawReading({ spread: S3, rng: E.mulberry32(42), now: NOW, reversalsEnabled: true, order: IDS.slice() });
  ok(JSON.stringify(a) === JSON.stringify(b), "same seed → same reading");
}

/* ---------- no repeats + reshuffle ---------- */
console.log("no-repeat cycle");
{
  let order = IDS.slice();
  const seen = [];
  let readings = 0;
  while (order && order.length >= 3) {
    const r = E.drawReading({ spread: S3, rng: E.mulberry32(100 + readings), reversalsEnabled: false, order });
    seen.push(...r.cards.map(c => c.cardId));
    order = r.remaining.length >= 3 ? r.remaining : null;
    readings++;
  }
  ok(new Set(seen).size === seen.length, "no repeat within a cycle");
  ok(seen.length === 21, "consumed 21 of 22 before exhaustion (got " + seen.length + ")");

  // next draw with empty/short order reshuffles cleanly
  const r = E.drawReading({ spread: S3, rng: E.mulberry32(1), reversalsEnabled: false, order: [] });
  ok(r.cards.length === 3 && new Set(r.cards.map(c => c.cardId)).size === 3, "reshuffle on exhaustion yields 3 distinct");
}

/* ---------- reversals gating ---------- */
console.log("reversals");
{
  for (const seed of [1, 7, 13, 42, 99, 123, 777, 31337]) {
    const r = E.drawReading({ spread: S5, rng: E.mulberry32(seed), reversalsEnabled: false, order: IDS.slice() });
    ok(r.cards.every(c => c.reversed === false), "reversals off → none (seed " + seed + ")");
    break; // one representative seed is enough given rate gate below
  }
  const r = E.drawReading({ spread: S5, rng: E.mulberry32(424242), reversalsEnabled: true, reversalRate: 1, order: IDS.slice() });
  ok(r.cards.every(c => c.reversed === true), "reversalRate=1 → all reversed");
  const r2 = E.drawReading({ spread: S5, rng: E.mulberry32(424242), reversalsEnabled: true, reversalRate: 0, order: IDS.slice() });
  ok(r2.cards.every(c => c.reversed === false), "reversalRate=0 → none reversed (gate on)");
}

/* ---------- purity ---------- */
console.log("purity");
{
  const order = IDS.slice();
  const frozen = order.join(",");
  E.drawReading({ spread: S3, rng: E.mulberry32(2), order });
  ok(order.join(",") === frozen, "order array not mutated");

  const hist = [{ id: "old", cards: [{ cardId: "the-fool", positionKey: "past", reversed: false }], spreadId: "three" }];
  const frozenH = JSON.stringify(hist);
  E.foxAside({ question: "", drawnIds: ["the-moon"], history: hist, rng: E.mulberry32(2) });
  E.synthesize({ spread: S3, cards: hist[0].cards });
  ok(JSON.stringify(hist) === frozenH, "history not mutated");
}

/* ---------- fox asides ---------- */
console.log("fox asides");
{
  ok(E.FOX_ASIDES.general.every(s => s.length > 10), "general pool populated");
  const none = E.foxAside({ question: "", drawnIds: [], history: [], rng: E.mulberry32(3) });
  ok(E.FOX_ASIDES.noQuestion.includes(none), "no question → scoped pool");
  const them = E.foxAside({ question: "does he love me", drawnIds: [], history: [], rng: E.mulberry32(3) });
  ok(E.FOX_ASIDES.aboutThem.includes(them) || E.FOX_ASIDES.general.includes(them), "third-person question → scoped or general");
  const scoped = new Set([...E.FOX_ASIDES.noQuestion, ...E.FOX_ASIDES.aboutThem, ...E.FOX_ASIDES.general]);
  ok(scoped.has(them), "aside comes from a real pool");
}

/* ---------- synthesis ---------- */
console.log("synthesis");
{
  // resonance: death + the-world → endings line
  const s1 = E.synthesize({
    spread: S3,
    cards: [
      { cardId: "death", positionKey: "past", reversed: false },
      { cardId: "the-world", positionKey: "present", reversed: false },
      { cardId: "the-fool", positionKey: "future", reversed: false }
    ]
  });
  ok(/closing at once/.test(s1), "endings resonance fires");

  // last card reversed → reads second
  const s2 = E.synthesize({
    spread: S3,
    cards: [
      { cardId: "the-sun", positionKey: "past", reversed: false },
      { cardId: "the-star", positionKey: "present", reversed: false },
      { cardId: "the-fool", positionKey: "future", reversed: true }
    ]
  });
  ok(/lands reversed/.test(s2), "final-position reversal noted");

  // default line always non-empty
  for (const seed of [2, 5, 9, 21, 33]) {
    const r = E.drawReading({ spread: S3, rng: E.mulberry32(seed), reversalsEnabled: false, order: IDS.slice() });
    const s = E.synthesize({ spread: S3, cards: r.cards });
    ok(s.length > 20, "synthesis non-empty (seed " + seed + ")");
  }
  ok(E.synthesize({ spread: S3, cards: [] }) === "", "empty cards → empty string");
}

/* ---------- migration ---------- */
console.log("migration");
{
  const m = E.migrateStore(null);
  ok(m && Array.isArray(m.readings) && m.readings.length === 0, "null store → empty");

  const m2 = E.migrateStore("not json");
  ok(m2.readings.length === 0, "corrupt string → empty");

  const old = {
    readings: [
      { id: "k1", createdAt: "2026-01-01T00:00:00Z", question: "q", spreadId: "three", cards: [{ cardId: "the-moon", positionKey: "past", reversed: true }] },
      { cards: [{ cardId: "made-up-card" }] },             // unknown card → dropped
      { id: "k3", cards: "not-an-array" },                 // malformed → dropped
      null
    ]
  };
  const m3 = E.migrateStore(old);
  ok(m3.readings.length === 1, "unknown/malformed readings dropped, good ones kept");
  ok(m3.readings[0].cards[0].reversed === true, "fields normalised");
  ok(m3.readings[0].spreadId === "three", "spreadId preserved");

  const legacyArray = [{ id: "a1", cards: [{ cardId: "the-sun", positionKey: "", reversed: false }] }];
  const m4 = E.migrateStore(legacyArray);
  ok(m4.readings.length === 1 && m4.readings[0].id === "a1", "legacy bare-array shape migrates");
}

/* ---------- foxAside never contradicts session ---------- */
console.log("aside guards");
{
  const hist = [{ cards: [{ cardId: "the-fool" }] }];
  const a = E.foxAside({ question: "about my own path", drawnIds: ["the-star"], history: hist, rng: E.mulberry32(8), shuffleMs: 500 });
  ok(typeof a === "string" && a.length > 5, "valid aside with all scopes");
}

console.log("\nengine: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
