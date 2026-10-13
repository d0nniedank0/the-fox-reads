/* ==========================================================================
   The Fox Reads — engine (DOM-free)
   Pure functions: every fn takes `now`, `rng` explicitly where time or
   randomness matters. No DOM access anywhere in this file.
   ========================================================================== */

/* ---------- seeded PRNG (mulberry32) ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- the 22 major arcana (authored voice, PLAN §5) ---------- */
const CARDS = [
  {
    id: "the-fool", name: "The Fool", numeral: "0",
    img: "assets/rws/00-the-fool.jpg",
    upright: "Everyone reads this as \u201ctake the leap, believe in yourself.\u201d I don\u2019t think that\u2019s it. The Fool is the one person in the story who hasn\u2019t decided yet what\u2019s possible \u2014 he isn\u2019t brave, he\u2019s just early. There\u2019s nothing to do with this card. That\u2019s the card. Stay early a little longer.",
    reversed: "Same start, except you\u2019ve already read the terms and conditions and you\u2019re still calling it a leap. Fine \u2014 it\u2019s a calculation. Just don\u2019t file it under faith.",
    keywords: ["beginnings", "not knowing", "early"]
  },
  {
    id: "the-magician", name: "The Magician", numeral: "I",
    img: "assets/rws/01-the-magician.jpg",
    upright: "You already have everything you need for this. That gets read as encouragement; my read is that it\u2019s an inventory. The card is asking you to name the tools out loud. If you can\u2019t name them, you don\u2019t have them yet and you\u2019re probably bluffing.",
    reversed: "Same trick, no substance. The performance of competence instead of the thing itself. The tell is when you start explaining instead of building.",
    keywords: ["resources", "capability", "showing work"]
  },
  {
    id: "the-high-priestess", name: "The High Priestess", numeral: "II",
    img: "assets/rws/02-the-high-priestess.jpg",
    upright: "Something you already know and haven\u2019t said out loud. The card isn\u2019t being secretive for drama \u2014 it\u2019s pointing out that you have the answer and you\u2019re shopping for a second opinion anyway. Sit with it before you go looking.",
    reversed: "You\u2019re ignoring something you already know and calling it patience. It isn\u2019t patience.",
    keywords: ["knowing", "silence", "second opinions"]
  },
  {
    id: "the-empress", name: "The Empress", numeral: "III",
    img: "assets/rws/03-the-empress.jpg",
    upright: "Something is growing and you didn\u2019t do much to cause it. That makes people nervous, so they intervene. Don\u2019t. This is one of the few cards where the correct move is to leave it alone and go do something else.",
    reversed: "Same growth, choked. Usually because someone is standing over it checking daily. Often that someone is you.",
    keywords: ["growth", "patience", "leaving it alone"]
  },
  {
    id: "the-emperor", name: "The Emperor", numeral: "IV",
    img: "assets/rws/04-the-emperor.jpg",
    upright: "Structure, rules, the wall that keeps the thing safe. Reads as boring and it\u2019s the reason anything survives long enough to be worth protecting. Where\u2019s the wall here? If the answer is \u201cthere isn\u2019t one,\u201d that\u2019s the reading.",
    reversed: "Rigid, controlling, or a throne with nobody sitting on it. Either way the structure is doing less than it looks like it\u2019s doing.",
    keywords: ["structure", "boundaries", "authority"]
  },
  {
    id: "the-hierophant", name: "The Hierophant", numeral: "V",
    img: "assets/rws/05-the-hierophant.jpg",
    upright: "Inherited rules. Somebody else\u2019s answer to your question, handed down and never checked. The card isn\u2019t telling you to obey them \u2014 it\u2019s telling you they\u2019re in the room. Ask who wrote them.",
    reversed: "You\u2019ve started breaking the rule without understanding why it existed. Half the time that\u2019s the right call, and you still owe yourself the ten minutes it takes to find out.",
    keywords: ["inherited rules", "institutions", "asking why"]
  },
  {
    id: "the-lovers", name: "The Lovers", numeral: "VI",
    img: "assets/rws/06-the-lovers.jpg",
    upright: "Not a romance card, whatever the name says. It\u2019s a choice between two things you genuinely want, which is exactly why it\u2019s uncomfortable to sit with. If it were obvious you wouldn\u2019t have drawn it.",
    reversed: "Choosing by not choosing. Still a choice \u2014 you\u2019re just not in the room when it gets made.",
    keywords: ["choice", "alignment", "wanting two things"]
  },
  {
    id: "the-chariot", name: "The Chariot", numeral: "VII",
    img: "assets/rws/07-the-chariot.jpg",
    upright: "Forward motion on willpower, and the card is honest that it\u2019s willpower and not a plan. Hard rule attached: you can drive it, or you can lose it. Not much in between.",
    reversed: "Same drive, wheels not touching the road. Going hard in a direction you haven\u2019t checked. Slowing down feels like failure and it\u2019s the only move available.",
    keywords: ["drive", "momentum", "control"]
  },
  {
    id: "strength", name: "Strength", numeral: "VIII",
    img: "assets/rws/08-strength.jpg",
    upright: "Not force. It\u2019s a person handling something that could hurt them, calmly, and the calm is the strength \u2014 everyone wants this card to be about power. It\u2019s about not flinching.",
    reversed: "Fine control lost. The temper, the fear, the appetite got a hand on the wheel. This usually shows up right before you justify something to yourself.",
    keywords: ["restraint", "calm", "not flinching"]
  },
  {
    id: "the-hermit", name: "The Hermit", numeral: "IX",
    img: "assets/rws/09-the-hermit.jpg",
    upright: "Going quiet on purpose. Not hiding \u2014 staying still long enough to hear your own read without four other opinions in the room. If you\u2019ve been asking everyone, this card is the message: stop asking.",
    reversed: "Same withdrawal, no end date. Loneliness dressed up as discernment. The tell is whether you\u2019re still learning anything in there.",
    keywords: ["withdrawal", "solitude", "your own read"]
  },
  {
    id: "wheel-of-fortune", name: "Wheel of Fortune", numeral: "X",
    img: "assets/rws/10-wheel-of-fortune.jpg",
    upright: "The part you don\u2019t control. The card isn\u2019t promising it gets better \u2014 it\u2019s saying the wheel moved without asking you and it will move again. My read: plan for the next turn rather than this one.",
    reversed: "You\u2019re fighting the turn you\u2019re already in. Resisting, delaying, pretending it\u2019s the same season it was. It isn\u2019t.",
    keywords: ["timing", "what you don\u2019t control", "turns"]
  },
  {
    id: "justice", name: "Justice", numeral: "XI",
    img: "assets/rws/11-justice.jpg",
    upright: "Cause and effect, applied honestly. There\u2019s no comfort in it. This usually shows up when you already know the answer is fair and you don\u2019t like it.",
    reversed: "Something is being decided with one side missing. Yours or theirs \u2014 check which.",
    keywords: ["cause and effect", "fairness", "the fair answer"]
  },
  {
    id: "the-hanged-man", name: "The Hanged Man", numeral: "XII",
    img: "assets/rws/12-the-hanged-man.jpg",
    upright: "Suspended, and it\u2019s voluntary \u2014 that\u2019s the whole distinction from every other stuck card. Nothing is happening on purpose, and the point is the view from upside down. You see the thing differently or you don\u2019t. Waiting without looking at it is just waiting.",
    reversed: "Same stake, no benefit. Martyrdom with nothing learned at the end. Ask what you\u2019re waiting for, and whether anyone actually asked you to.",
    keywords: ["suspension", "perspective", "voluntary waiting"]
  },
  {
    id: "death", name: "Death", numeral: "XIII",
    img: "assets/rws/13-death.jpg",
    upright: "Over. Not dying \u2014 an ending that already happened and you\u2019re still doing the paperwork on. This card is the one people flinch at for no reason, and it\u2019s unambiguous. The thing is finished. Everything after this is admin.",
    reversed: "Dragging it out. Keeping the corpse in the room because the alternative is a blank page. Understandable, and still the same ending \u2014 later, and more expensive.",
    keywords: ["endings", "admin", "finishing"]
  },
  {
    id: "temperance", name: "Temperance", numeral: "XIV",
    img: "assets/rws/14-temperance.jpg",
    upright: "The boring miracle. Small adjustments, ongoing, no single decision that fixes it. Everyone wants the plot point; this card is the daily ten percent. Least glamorous card in the deck, and the one that actually works.",
    reversed: "All or nothing, swinging. Bouncing between extremes and calling it balance because you average out. Averages hide a lot.",
    keywords: ["increments", "patience", "the daily ten percent"]
  },
  {
    id: "the-devil", name: "The Devil", numeral: "XV",
    img: "assets/rws/15-the-devil.jpg",
    upright: "The chain is loose. That\u2019s what the card is actually showing you. Whatever this is \u2014 the habit, the arrangement, the person \u2014 it holds you because you\u2019ve decided it does, and you\u2019ve decided it monthly for a while now. Not judging. Just noting the chain isn\u2019t locked.",
    reversed: "The break. You see it for what it is and most of the weight drops off immediately. Sometimes it comes back smaller. It usually comes back smaller.",
    keywords: ["attachment", "habit", "a loose chain"]
  },
  {
    id: "the-tower", name: "The Tower", numeral: "XVI",
    img: "assets/rws/16-the-tower.jpg",
    upright: "Something built on a bad assumption comes down. It\u2019s loud, it feels like punishment, and it isn\u2019t. My read: it\u2019s a fact arriving late. The tower was already wrong, you just got the notification. If you\u2019re asking about this card, part of you already has the tape measure out.",
    reversed: "The collapse happens internally and you keep the outside tidy. Slower, less dramatic, hurts the same. The card doesn\u2019t care which version you pick.",
    keywords: ["collapse", "late information", "bad foundations"]
  },
  {
    id: "the-star", name: "The Star", numeral: "XVII",
    img: "assets/rws/17-the-star.jpg",
    upright: "Aftermath. Not a rescue and not a win \u2014 the first night you can breathe. I read this as hope in the technical sense: the belief that the next small thing is worth doing. So do the next small thing. That\u2019s all it\u2019s asking.",
    reversed: "You don\u2019t believe it\u2019s coming back yet. That\u2019s not pessimism, it\u2019s just where you are. The card doesn\u2019t argue with you; it waits.",
    keywords: ["aftermath", "hope", "the next small thing"]
  },
  {
    id: "the-moon", name: "The Moon", numeral: "XVIII",
    img: "assets/rws/18-the-moon.jpg",
    upright: "You\u2019re getting information and none of it is reliable, including your own read on it. The Moon isn\u2019t lying to you \u2014 it doesn\u2019t have a clear picture either. Stop deciding things from here. Wait for light.",
    reversed: "The fog lifts. What\u2019s underneath is usually smaller than you feared, which is its own mild disappointment and much easier to work with.",
    keywords: ["unreliable information", "fog", "waiting"]
  },
  {
    id: "the-sun", name: "The Sun", numeral: "XIX",
    img: "assets/rws/19-the-sun.jpg",
    upright: "The rare card with nothing hidden. Things are fine, plainly, and the correct response is to say so out loud instead of waiting for the catch. If you\u2019ve been braced for the catch for weeks, that\u2019s worth noticing too.",
    reversed: "Something good is happening and you\u2019re not in it. Either too tired to feel it or you\u2019ve decided you don\u2019t deserve it. Both fixable. Neither automatic.",
    keywords: ["plain good", "no catch", "allowed"]
  },
  {
    id: "judgement", name: "Judgement", numeral: "XX",
    img: "assets/rws/20-judgement.jpg",
    upright: "The call. Not a verdict on you \u2014 an invitation, and the entire card is about whether you answer it. Everyone reads this as reckoning; my read is it\u2019s more like your own name being said across a room.",
    reversed: "You heard it and you\u2019re pretending you didn\u2019t. It\u2019ll come around again. These usually do.",
    keywords: ["the call", "answering", "self-reckoning"]
  },
  {
    id: "the-world", name: "The World", numeral: "XXI",
    img: "assets/rws/21-the-world.jpg",
    upright: "Done. Complete, closed, one lap finished. The anti-climax is built in \u2014 you\u2019ll feel nothing at first and then you\u2019ll miss the thing you were trying to finish. That\u2019s not a problem. That\u2019s the next Fool card arriving.",
    reversed: "Almost. Nine-tenths of the way and stalled on the last step, usually because finishing means the next thing starts.",
    keywords: ["completion", "anti-climax", "the next lap"]
  }
];

/* ---------- spreads (PLAN §6) ---------- */
const SPREADS = [
  {
    id: "one",
    name: "One card",
    blurb: "What do I need to see today.",
    positions: [
      { key: "signal", label: "The signal", framing: "What you need to see today" }
    ]
  },
  {
    id: "three",
    name: "Three cards",
    blurb: "Past, present, future.",
    positions: [
      { key: "past",    label: "What brought you here", framing: "What brought you here" },
      { key: "present", label: "Where you actually are", framing: "Where you actually are" },
      { key: "future",  label: "Where it\u2019s heading",    framing: "Where it\u2019s heading" }
    ]
  },
  {
    id: "five",
    name: "Five cards",
    blurb: "The decision spread.",
    positions: [
      { key: "situation",  label: "The situation",       framing: "The situation as it stands" },
      { key: "against",    label: "What\u2019s against you", framing: "What\u2019s working against you" },
      { key: "underneath", label: "What\u2019s underneath",  framing: "What\u2019s actually underneath it" },
      { key: "todo",       label: "What to do",          framing: "What to do about it" },
      { key: "lands",      label: "Where it lands",      framing: "Where it lands if you do" }
    ]
  }
];

/* ---------- fox asides (PLAN §4b) ---------- */
const FOX_ASIDES = {
  general: [
    "I read the cards. I don\u2019t decide anything for you. That part stays yours.",
    "Cards don\u2019t tell you what happens. They tell you what you already suspect.",
    "I\u2019ll be honest with you because you were kind to the deck.",
    "The deck does the talking. I just arrange it and mind the door.",
    "Take what\u2019s useful. Leave the rest where it lies."
  ],
  noQuestion: [
    "You didn\u2019t ask a question. I\u2019ll read anyway \u2014 I just have less to work with.",
    "No question. The cards will pick something for you. They usually know."
  ],
  aboutThem: [
    "You asked about them and not about you. Interesting.",
    "This one is for you, not for them. You\u2019ll see.",
    "You put someone else at the centre of your own question. I\u2019m noting that."
  ],
  repeat: [
    "That card\u2019s back. I\u2019m not saying anything. I\u2019m writing it down.",
    "Again with this card. Ask it differently next time."
  ],
  longShuffle: [
    "You shuffled for a long time. I noticed.",
    "A long shuffle. Either the question matters or it\u2019s hard to hold."
  ],
  shortShuffle: [
    "Quick hands. The cards had no time to complain.",
    "That was a fast shuffle. I hope the question was easy."
  ]
};

const THIRD_PERSON_HINTS = [
  "what does", "does he", "does she", "will he", "will she", "is he", "is she",
  "are they", "do they", "about him", "about her", "about them", "about my ex",
  "with him", "with her", "with them", "love me", "loves me"
];

/* ---------- shuffle + draw ---------- */
function shuffleDeck(deckIds, rng) {
  const arr = deckIds.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

/**
 * drawReading: pops `need` cards off the current cycle order.
 * - No repeats until the pool is exhausted: `order` (the remaining cycle
 *   deck) is passed in; when it can't cover the spread, the engine
 *   reshuffles the full deck — that's the new cycle.
 * - Never mutates `history` or the passed `order` (copy-on-write).
 * - Reversals only when enabled.
 */
function drawReading(opts) {
  const spread    = opts.spread;
  const rng       = opts.rng || Math.random;
  const now       = opts.now || new Date().toISOString();
  const reversals = !!opts.reversalsEnabled;
  const rate      = typeof opts.reversalRate === "number" ? opts.reversalRate : 0.25;
  const need      = spread.positions.length;

  let order = Array.isArray(opts.order) ? opts.order.filter(id => CARDS.some(c => c.id === id)) : null;
  if (!order || order.length < need) {
    order = shuffleDeck(CARDS.map(c => c.id), rng);   // fresh cycle
  }

  const picked    = order.slice(0, need);
  const remaining = order.slice(need);

  const cards = picked.map((cardId, i) => ({
    cardId,
    positionKey: spread.positions[i].key,
    reversed: reversals ? (rng() < rate) : false
  }));

  return {
    id: "r" + Math.floor(rng() * 1e12).toString(36),
    createdAt: now,
    question: opts.question || "",
    spreadId: spread.id,
    reversalsUsed: reversals,
    cards,
    remaining,          // carry to the next draw; empty → next draw reshuffles
    schemaVersion: 1
  };
}

/* ---------- fox aside selection (scoped first, general fallback) ---------- */
function foxAside(opts) {
  const question   = (opts.question || "").toLowerCase();
  const drawnIds   = opts.drawnIds || [];
  const history    = opts.history || [];
  const rng        = opts.rng || Math.random;
  const shuffleMs  = typeof opts.shuffleMs === "number" ? opts.shuffleMs : null;

  const pool = [];

  if (!question.trim()) {
    pool.push(...FOX_ASIDES.noQuestion);
  } else {
    for (const h of THIRD_PERSON_HINTS) {
      if (question.includes(h)) { pool.push(...FOX_ASIDES.aboutThem); break; }
    }
  }

  if (drawnIds.length && history.length) {
    const past = new Set();
    for (const r of history) for (const c of (r.cards || [])) past.add(c.cardId);
    if (drawnIds.some(id => past.has(id))) pool.push(...FOX_ASIDES.repeat);
  }

  if (shuffleMs !== null) {
    if (shuffleMs > 45000) pool.push(...FOX_ASIDES.longShuffle);
    else if (shuffleMs < 8000) pool.push(...FOX_ASIDES.shortShuffle);
  }

  const effective = pool.length ? pool : FOX_ASIDES.general.slice();
  // dedupe scoped+general overlap is unnecessary (general only joins when pool empty)
  const pick = FOX_ASIDES.general.length && effective.length
    ? effective[Math.floor(rng() * effective.length)]
    : FOX_ASIDES.general[0];
  return pick;
}

/* ---------- synthesis (authored connector rules; deterministic) ---------- */
const REGISTER = {
  // keyword buckets: which cards talk about endings, waiting, structure, truth
  endings:   ["death", "the-tower", "the-world", "judgement"],
  waiting:   ["the-hanged-man", "the-moon", "temperance", "the-star", "wheel-of-fortune"],
  structure: ["the-emperor", "the-hierophant", "justice", "the-chariot"],
  starting:  ["the-fool", "the-magician", "the-star", "the-sun"]
};
function bucketOf(cardId) {
  for (const b in REGISTER) if (REGISTER[b].includes(cardId)) return b;
  return null;
}

function synthesize(opts) {
  const spread  = opts.spread;
  const cards   = opts.cards || [];     // [{cardId, reversed, positionKey}]
  const byId    = opts.byId || (id => CARDS.find(c => c.id === id));
  if (!cards.length) return "";

  const lines = [];
  const n = cards.length;

  // 1) bucket resonance (one line max, strongest bucket wins)
  const buckets = {};
  for (const c of cards) {
    const b = bucketOf(c.cardId);
    if (b) (buckets[b] = buckets[b] || []).push(c);
  }
  for (const b of Object.keys(buckets)) {
    if (buckets[b].length >= 2) {
      const names = buckets[b].map(c => byId(c.cardId).name);
      const joined = names.length === 2 ? names.join(" and ") : names.join(", ");
      if (b === "endings")   lines.push(joined + " in one reading is a lot of things closing at once. Let them.");
      if (b === "waiting")   lines.push(joined + " agree on one thing: this is not the moment to force it.");
      if (b === "structure") lines.push(joined + " lean the same way \u2014 whatever you decide, it needs walls.");
      if (b === "starting")  lines.push(joined + " point the same direction: forward, without a fully loaded plan.");
      break; // intentionally: one resonance line per reading
    }
  }

  // 2) a reversal in the final position reads second, from underneath
  const last = cards[n - 1];
  if (last && last.reversed) {
    const posLabel = (spread.positions[n - 1].label || "").toLowerCase();
    const c = byId(last.cardId);
    lines.push("And " + c.name + " lands reversed on \u201c" + posLabel + "\u201d \u2014 same subject, from underneath. Read it second.");
  }

  // 3) all-reversed reading, or default hand-back
  const allReversed = cards.every(c => c.reversed);
  if (allReversed && n > 1) {
    lines.push("Every card came up reversed. Either the deck is being blunt with you, or the read here is about the underside of things \u2014 start there.");
  } else if (lines.length === 0) {
    lines.push(defaultLine(spread, cards, byId));
  }

  return lines.join(" ");
}

function defaultLine(spread, cards, byId) {
  const names = cards.map(c => {
    const card = byId(c.cardId);
    return card.name + (c.reversed ? " (reversed)" : "");
  });
  return "As a set: " + listNames(names) + ". No hidden alliance between them \u2014 read each one where it sits.";
}

function listNames(names) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return names[0] + " and " + names[1];
  return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
}

/* ---------- store migration (day-one, PLAN §8) ---------- */
function migrateReading(r) {
  if (!r || typeof r !== "object") return null;
  const out = {
    id: typeof r.id === "string" && r.id ? r.id : "r" + Math.random().toString(36).slice(2, 10),
    createdAt: typeof r.createdAt === "string" && r.createdAt ? r.createdAt : new Date(1970, 0, 1).toISOString(),
    question: typeof r.question === "string" ? r.question : "",
    spreadId: SPREADS.some(s => s.id === r.spreadId) ? r.spreadId : "three",
    reversalsUsed: !!r.reversalsUsed,
    cycleId: Number.isFinite(r.cycleId) ? r.cycleId : undefined,
    foxAside: typeof r.foxAside === "string" ? r.foxAside : "",
    schemaVersion: 1,
    cards: []
  };
  if (Array.isArray(r.cards)) {
    for (const c of r.cards) {
      if (!c || typeof c !== "object") continue;
      const known = CARDS.find(k => k.id === c.cardId);
      if (!known) continue;
      out.cards.push({
        cardId: known.id,
        positionKey: typeof c.positionKey === "string" ? c.positionKey : "",
        reversed: !!c.reversed
      });
    }
  }
  if (out.cards.length === 0) return null;   // unsalvageable
  return out;
}

function migrateStore(raw) {
  const store = { readings: [], meta: {} };
  let obj = raw;
  if (typeof raw === "string") {
    try { obj = JSON.parse(raw); } catch (e) { return store; }
  }
  if (!obj || typeof obj !== "object") return store;
  if (Array.isArray(obj)) {
    store.readings = obj.map(migrateReading).filter(Boolean);
    return store;
  }
  if (Array.isArray(obj.readings)) {
    store.readings = obj.readings.map(migrateReading).filter(Boolean);
  }
  if (obj.meta && typeof obj.meta === "object") store.meta = obj.meta;
  return store;
}

/* ---------- exports ---------- */
// Browser global: UI references `engine.*`; keep it window-visible.
if (typeof window !== "undefined") {
  window.engine = {
    mulberry32, shuffleDeck, drawReading, foxAside, synthesize,
    migrateReading, migrateStore,
    CARDS, SPREADS, FOX_ASIDES, THIRD_PERSON_HINTS, REGISTER, bucketOf
  };
}
// Node: direct require.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    mulberry32, shuffleDeck, drawReading, foxAside, synthesize,
    migrateReading, migrateStore,
    CARDS, SPREADS, FOX_ASIDES, THIRD_PERSON_HINTS, REGISTER, bucketOf
  };
}
