# The Fox Reads — build plan

A tarot reading app. Built as a gift for a friend who is into tarot, and left open for anyone else who wanders in.

---

## 1. The promise (one sentence)

> **A fox reads your cards for you.** You ask a real question, you shuffle it yourself, and you get an honest reading you can keep.

Verb with a recipient and a consequence. If a design decision makes the app do less than this, the decision is wrong.

## 2. The story this is built on

The author does not read cards. A friend asked him for a reading and he couldn't give her one — so he built a fox who does it instead.

That framing is the whole product, and it should be visible in the app, not just in this document:

- The app does not claim to be supernatural. It's a reading from a friend, delivered through a fox. That honest fiction is what lets it be charming without being a lie.
- The fox is the reader. The author is the author — credited, named, present.
- The reading is the gift. The cuteness is what makes it fun to open.

## 3. Non-negotiables (the bar this has to clear)

The recipient is genuinely into tarot. That sets the standard:

1. **The readings must be good.** Not fortune-cookie, not ironic, not "The Tower: change is coming." If the card text is vague, she will be polite once and never open it again.
2. **Respect the practice.** Tarot people care about ritual and about how reversals are read. Getting these right costs nothing and buys all the credibility.
3. **Cute on the outside, sharp on the inside.** The charm opens the door; the reading is why anyone comes back.
4. **The app never decides.** The user shuffles. The app deals what the user's own shuffle produced.

## 4. Voice

### 4a. Source of truth

The card text is written in the author's own voice, calibrated against his existing voice profiles — read these before writing or editing any card copy:

- `chaos-playbook/profiles/daanisharif/voice.md` (tweet register — the working baseline)
- `chaos-playbook/profiles/daanisharif/voice-longform.md` (long-form register — reasoning journey, hedging, evidence discipline)

What that means in practice for card text:

- **First person, thinking in public.** "My read is…", "I don't think that's it." Not a dictionary entry.
- **Contrast before conclusion.** Say what everyone reads the card as, then say what it actually is. The distinction is the value.
- **Hedges are native.** "usually", "on paper", "it seems", "my read". Never false certainty.
- **Short standalone sentences for rhythm.** A long explanatory sentence followed by a four-word one.
- **Concrete, not mystical.** Name the situation, not the vibe. No "the universe", no "energy", no "vibration".
- **End on a pointed observation or the question it raises.** Never a hollow uplift.
- **Fair to the uncomfortable card.** The Tower isn't punishment, Death isn't death. Say the honest thing without drama.

Avoid, per the voice profile: generic hype, empty superlatives, forced rule-of-three, polished "not X but Y" symmetry everywhere, decorative metaphors, emoji, and over-polishing the prose into a press release. Keep the roughness.

### 4b. The fox's voice — deliberately NOT the author's

The fox is a separate character and must read differently from the card text: oblique, observant, slightly uncanny, never mean. It notices things about the *querent*, not about the cards. One line per reading, shown apart from the card text. It never explains itself and it never lies cleanly.

Sample asides:

- "You asked about them and not about you. Interesting."
- "You shuffled for a long time. I noticed."
- "You didn't ask a question. I'll read anyway — I just have less to work with."
- "That's the third reading with this card. I'm not saying anything. I'm writing it down."
- "This one is for you, not for them. You'll see."

Asides are drawn from a pool, scoped where possible to what actually happened (no question written, repeated card across readings, third-party wording). If a scoped aside doesn't apply, fall back to a general pool — never show a line that contradicts the session.

### 4c. The first-run letter

One time only, before any cards. Clearly from the author, not the fox. Re-readable via a "from the author" link in the footer.

> I don't read cards. A friend asked me for a reading, so I found a fox who does.
>
> Ask it something real. Hold the question while you shuffle. Be kind to it and it'll be honest with you.
>
> — **CHΛOS**

## 5. The deck — all 22 major arcana

Written in the author's voice. Ship-ready as drafted; the author still reads it through once before it goes out, because the voice is the gift. Each card carries `keywords` for the synthesis layer (§8).

---

**0 · The Fool** — `beginnings, not knowing, early`
**Upright.** Everyone reads this as "take the leap, believe in yourself." I don't think that's it. The Fool is the one person in the story who hasn't decided yet what's possible — he isn't brave, he's just early. There's nothing to do with this card. That's the card. Stay early a little longer.
**Reversed.** Same start, except you've already read the terms and conditions and you're still calling it a leap. Fine — it's a calculation. Just don't file it under faith.

**I · The Magician** — `resources, capability, showing work`
**Upright.** You already have everything you need for this. That gets read as encouragement; my read is that it's an inventory. The card is asking you to name the tools out loud. If you can't name them, you don't have them yet and you're probably bluffing.
**Reversed.** Same trick, no substance. The performance of competence instead of the thing itself. The tell is when you start explaining instead of building.

**II · The High Priestess** — `knowing, silence, second opinions`
**Upright.** Something you already know and haven't said out loud. The card isn't being secretive for drama — it's pointing out that you have the answer and you're shopping for a second opinion anyway. Sit with it before you go looking.
**Reversed.** You're ignoring something you already know and calling it patience. It isn't patience.

**III · The Empress** — `growth, patience, leaving it alone`
**Upright.** Something is growing and you didn't do much to cause it. That makes people nervous, so they intervene. Don't. This is one of the few cards where the correct move is to leave it alone and go do something else.
**Reversed.** Same growth, choked. Usually because someone is standing over it checking daily. Often that someone is you.

**IV · The Emperor** — `structure, boundaries, authority`
**Upright.** Structure, rules, the wall that keeps the thing safe. Reads as boring and it's the reason anything survives long enough to be worth protecting. Where's the wall here? If the answer is "there isn't one," that's the reading.
**Reversed.** Rigid, controlling, or a throne with nobody sitting on it. Either way the structure is doing less than it looks like it's doing.

**V · The Hierophant** — `inherited rules, institutions, asking why`
**Upright.** Inherited rules. Somebody else's answer to your question, handed down and never checked. The card isn't telling you to obey them — it's telling you they're in the room. Ask who wrote them.
**Reversed.** You've started breaking the rule without understanding why it existed. Half the time that's the right call, and you still owe yourself the ten minutes it takes to find out.

**VI · The Lovers** — `choice, alignment, wanting two things`
**Upright.** Not a romance card, whatever the name says. It's a choice between two things you genuinely want, which is exactly why it's uncomfortable to sit with. If it were obvious you wouldn't have drawn it.
**Reversed.** Choosing by not choosing. Still a choice — you're just not in the room when it gets made.

**VII · The Chariot** — `drive, momentum, control`
**Upright.** Forward motion on willpower, and the card is honest that it's willpower and not a plan. Hard rule attached: you can drive it, or you can lose it. Not much in between.
**Reversed.** Same drive, wheels not touching the road. Going hard in a direction you haven't checked. Slowing down feels like failure and it's the only move available.

**VIII · Strength** — `restraint, calm, not flinching`
**Upright.** Not force. It's a person handling something that could hurt them, calmly, and the calm is the strength — everyone wants this card to be about power. It's about not flinching.
**Reversed.** Fine control lost. The temper, the fear, the appetite got a hand on the wheel. This usually shows up right before you justify something to yourself.

**IX · The Hermit** — `withdrawal, solitude, your own read`
**Upright.** Going quiet on purpose. Not hiding — staying still long enough to hear your own read without four other opinions in the room. If you've been asking everyone, this card is the message: stop asking.
**Reversed.** Same withdrawal, no end date. Loneliness dressed up as discernment. The tell is whether you're still learning anything in there.

**X · Wheel of Fortune** — `timing, what you don't control, turns`
**Upright.** The part you don't control. The card isn't promising it gets better — it's saying the wheel moved without asking you and it will move again. My read: plan for the next turn rather than this one.
**Reversed.** You're fighting the turn you're already in. Resisting, delaying, pretending it's the same season it was. It isn't.

**XI · Justice** — `cause and effect, fairness, the fair answer`
**Upright.** Cause and effect, applied honestly. There's no comfort in it. This usually shows up when you already know the answer is fair and you don't like it.
**Reversed.** Something is being decided with one side missing. Yours or theirs — check which.

**XII · The Hanged Man** — `suspension, perspective, voluntary waiting`
**Upright.** Suspended, and it's voluntary — that's the whole distinction from every other stuck card. Nothing is happening on purpose, and the point is the view from upside down. You see the thing differently or you don't. Waiting without looking at it is just waiting.
**Reversed.** Same stake, no benefit. Martyrdom with nothing learned at the end. Ask what you're waiting for, and whether anyone actually asked you to.

**XIII · Death** — `endings, admin, finishing`
**Upright.** Over. Not dying — an ending that already happened and you're still doing the paperwork on. This card is the one people flinch at for no reason, and it's unambiguous. The thing is finished. Everything after this is admin.
**Reversed.** Dragging it out. Keeping the corpse in the room because the alternative is a blank page. Understandable, and still the same ending — later, and more expensive.

**XIV · Temperance** — `increments, patience, the daily ten percent`
**Upright.** The boring miracle. Small adjustments, ongoing, no single decision that fixes it. Everyone wants the plot point; this card is the daily ten percent. Least glamorous card in the deck, and the one that actually works.
**Reversed.** All or nothing, swinging. Bouncing between extremes and calling it balance because you average out. Averages hide a lot.

**XV · The Devil** — `attachment, habit, a loose chain`
**Upright.** The chain is loose. That's what the card is actually showing you. Whatever this is — the habit, the arrangement, the person — it holds you because you've decided it does, and you've decided it monthly for a while now. Not judging. Just noting the chain isn't locked.
**Reversed.** The break. You see it for what it is and most of the weight drops off immediately. Sometimes it comes back smaller. It usually comes back smaller.

**XVI · The Tower** — `collapse, late information, bad foundations`
**Upright.** Something built on a bad assumption comes down. It's loud, it feels like punishment, and it isn't. My read: it's a fact arriving late. The tower was already wrong, you just got the notification. If you're asking about this card, part of you already has the tape measure out.
**Reversed.** The collapse happens internally and you keep the outside tidy. Slower, less dramatic, hurts the same. The card doesn't care which version you pick.

**XVII · The Star** — `aftermath, hope, the next small thing`
**Upright.** Aftermath. Not a rescue and not a win — the first night you can breathe. I read this as hope in the technical sense: the belief that the next small thing is worth doing. So do the next small thing. That's all it's asking.
**Reversed.** You don't believe it's coming back yet. That's not pessimism, it's just where you are. The card doesn't argue with you; it waits.

**XVIII · The Moon** — `unreliable information, fog, waiting`
**Upright.** You're getting information and none of it is reliable, including your own read on it. The Moon isn't lying to you — it doesn't have a clear picture either. Stop deciding things from here. Wait for light.
**Reversed.** The fog lifts. What's underneath is usually smaller than you feared, which is its own mild disappointment and much easier to work with.

**XIX · The Sun** — `plain good, no catch, allowed`
**Upright.** The rare card with nothing hidden. Things are fine, plainly, and the correct response is to say so out loud instead of waiting for the catch. If you've been braced for the catch for weeks, that's worth noticing too.
**Reversed.** Something good is happening and you're not in it. Either too tired to feel it or you've decided you don't deserve it. Both fixable. Neither automatic.

**XX · Judgement** — `the call, answering, self-reckoning`
**Upright.** The call. Not a verdict on you — an invitation, and the entire card is about whether you answer it. Everyone reads this as reckoning; my read is it's more like your own name being said across a room.
**Reversed.** You heard it and you're pretending you didn't. It'll come around again. These usually do.

**XXI · The World** — `completion, anti-climax, the next lap`
**Upright.** Done. Complete, closed, one lap finished. The anti-climax is built in — you'll feel nothing at first and then you'll miss the thing you were trying to finish. That's not a problem. That's the next Fool card arriving.
**Reversed.** Almost. Nine-tenths of the way and stalled on the last step, usually because finishing means the next thing starts.

---

## 6. The reading flow

1. **First run only — the letter.** Then never again unprompted.
2. **Name.** "What should I call you?" Used by the fox afterwards. Stored locally. Personal for the recipient, still works for strangers.
3. **Ask.** Write a question. Optional, but the app says so plainly: no question means a weaker reading. The question is kept with the reading.
4. **Spread.** Pick what fits the question:
   - **One card** — "what do I need to see today"
   - **Three cards** — past / present / future
   - **Five cards** — situation / what's working against you / what's underneath / what to do / where it lands (decision spread)
5. **Shuffle — the user does it.** Hold to riffle, or drag the cards around. Copy on screen: *"Hold your question in your mind while you shuffle."* The app must never shuffle for them, and must never decide when to stop. The draw button appears only after the user has actually shuffled.
6. **Draw.** Cards flip one at a time, in position order. Each card shows: name, orientation, the meaning text (§5), and the position's framing line.
7. **The reading.** One short synthesis below the cards: how the drawn cards sit together, aimed at the question. Authored connector rules keyed to what came up (matching keywords, a reversal in the outcome position, two cards from the same register) — not free-form generation.
8. **The fox's aside.** One line, in the fox's voice (§4b).
9. **Keep it.** Saved to the book automatically.
10. **The book.** All past readings, newest first. Question, cards, date. This is what makes it a tool rather than a toy — on visit five, patterns are visible.

## 7. Data model

### Card
```
{
  id: "the-fool",            // slug, unique, stable
  name: "The Fool",
  numeral: "0",              // display only ("0", "I", ... "XXI")
  upright: "…",              // §5, author's voice
  reversed: "…",             // §5, author's voice
  keywords: ["beginnings", "not knowing", "early"]
}
```

### Spread
```
{
  id: "three",
  name: "Three cards",
  blurb: "Past, present, future.",
  positions: [
    { key: "past",    label: "What brought you here", framing: "…" },
    { key: "present", label: "Where you actually are", framing: "…" },
    { key: "future",  label: "Where it's heading",    framing: "…" }
  ]
}
```

### Reading (stored)
```
{
  id,                 // uuid
  createdAt,          // ISO string
  question,           // string, may be ""
  spreadId,
  reversalsUsed,      // bool — the setting as it stood for this reading
  cards: [ { cardId, positionKey, reversed } ],
  foxAside,
  schemaVersion: 1
}
```

## 8. Engine spec

Pure, no DOM, everything injected so it's testable.

- `mulberry32(seed)` seeded PRNG. `rng` is a parameter everywhere, defaulting to `Math.random` in the UI.
- `shuffleDeck(deckIds, rng)` — Fisher-Yates, returns a new array.
- `drawReading({ spread, rng, reversalsEnabled, reversalRate = 0.3, history })` → `{ cards: [...] }`
  - **No repeats until the deck is exhausted.** Track drawn ids per cycle; when the pool empties, increment `cycleId` and allow repeats across cycles only.
  - Reversals applied only when `reversalsEnabled` is true. Never silently.
  - Must not mutate `history` — copy-on-write.
- `foxAside({ question, drawnIds, history, rng })` → string. Scoped pool first, general pool as fallback.
- `synthesize({ spread, cards, question })` → string. Authored connector rules; deterministic.
- `migrateReading(r)` / `migrateStore(store)` — normalise old shapes on load. **Write these on day one**, not later: people return to this app across weeks and breaking their book is the worst possible failure.
- `now` is always passed in explicitly, never read inside engine functions.
- No `module.exports` string anywhere in a comment — tests grep for it. Guard the UI with:
  `if (typeof document !== "undefined") { (function () { … })(); }`
  (A top-level `return` is a SyntaxError. Do not use it.)

## 9. Structure

- Single-file `index.html` for v1. Engine in its own `<script>` block at the bottom so tests can extract it.
- Views: `letter` → `ask` → `spread` → `shuffle` → `reading` → `book`, plus `about` (credits + from-the-author). One visible at a time.
- Persistent nav in the masthead so `book` and `about` are reachable from every view. Brand mark click returns home (needs a real click handler, not just an anchor scroll).
- Reversals setting lives in `about` or a small settings row — a visible toggle, persisted.

## 10. Aesthetic

**Do not build this in the candlelit-velvet, gold-foil, illuminated-manuscript register.** That is the author's Dungeons & Dragons tool family and this would read as a derivative sibling of it.

Go the other direction: a shrine, not a parlour.

- **Ground:** soft indigo `#25236b` for structure and depth; warm paper for reading surfaces.
- **Accent:** vermilion `#c84022`, used sparingly — the fox's mark, the draw button, one focal point per view. Not decoration.
- **Light:** moonlight and lantern, not candlelight.
- **Motifs if useful:** moon, lantern, cloud, stone, bridge. Restrained. Nothing sprinkled for texture.
- **The fox:** exactly one illustration, sitting with or behind the deck. Original art (or a traced vector). Card images can be Rider-Waite-Smith — see §12.
- **Type:** a literary serif for card text and the letter, a light sans for controls and labels. **Nothing that carries content goes below ~14px.** Do a bottom-to-top readability pass before shipping.
- No feature grids, no dashboard grammar, no stat chips. One ritual per screen.

## 11. Scope

### v1 — build this
- 22 **major arcana** only (text in §5 is done).
- Three spreads (1 / 3 / 5).
- First-run letter, name capture, footer credit, from-the-author link.
- User-driven shuffle.
- Reversals opt-in.
- Reading saved to the book; history persists.
- Engine tests + UI tests green.

### v2 — deliberately deferred
- 56 minors (big writing job — do it only if v1 lands).
- Shareable reading (copy-as-text; avoid image export for now).
- A daily card — one card, same for everyone, seeded from the date. Good second front door, but it competes with the "ask a real question" premise for v1.
- Original art for the majors.

## 12. Practical notes

- **Rider-Waite-Smith is public domain.** Published 1909 (US, pre-1930); Pamela Colman Smith died 1951, so it's clear in the UK/EU as of 2022. Real card images can be used legitimately. Verify the specific scan/source license before committing files to a public repo. The fox is the one piece of original art needed.
- **No runtime LLM.** All interpretation text is authored (§5). No API key, no per-read cost, no slop, one consistent voice.
- **Copy-as-text sharing** is the cheap v2 win. No server, no accounts, ever, for v1.
- `localStorage` only. **No accounts, no backend, no analytics.**
- Repo folder: `C:\Users\beenco\Documents\Vibes\fox-tarot\`. One git repo per project; commit early.

## 13. Test checklist

**Engine**
- [ ] Every card has a unique id, a name, and non-empty upright + reversed text
- [ ] Deck integrity: 22 cards, stable ids
- [ ] No repeat within a cycle; exactly one reshuffle when the pool empties
- [ ] Same seed → same reading (determinism)
- [ ] Reversals never appear when the setting is off
- [ ] `drawReading` does not mutate the history it's handed
- [ ] `migrateStore` normalises an old-shape fixture correctly
- [ ] `synthesize` returns a non-empty line for every spread/position combination

**UI (jsdom)**
- [ ] Letter shows on first run and not on second
- [ ] Draw button is absent until the user has shuffled
- [ ] Drawing produces the right number of cards for the spread
- [ ] Card text and the fox aside both render
- [ ] Reading persists across a reload (seed `localStorage` in `beforeParse`, not after construction)
- [ ] Book lists past readings
- [ ] Zero console errors

**Craft**
- [ ] Every text element ≥14px
- [ ] All `getElementById` targets exist in the HTML
- [ ] Verified on a local server before deploy

## 14. Decisions — settled

1. **The fox has no name.** An unnamed fox is more folkloric and more charming than a named one.
2. **The letter is signed CHΛOS.**
3. **The app asks for the person's name on the first run.** Same app for everyone, personal on arrival.
4. **The card text uses the author's voice**, calibrated to `profiles/daanisharif/voice.md` + `voice-longform.md` (§4a). Drafted in full in §5; the author reads it through once before ship.
5. **App title:** working title *The Fox Reads*. Changeable, not load-bearing. Alternatives: *Lantern*, *Kitsune*, *Twenty-Two*.

## 15. What to avoid

- Candlelit velvet, gold foil, IM Fell English, illuminated-manuscript framing — that's the D&D family's shelf, not this one.
- "The universe wants you to…", "the energy here is…", any sentence that could be true for anyone.
- Padding a reading to look substantial. Short and specific beats long and soft.
- An oracle-voice reader. The fox is a character, not a fortune dispenser.
- The fox sounding like the author. Two voices, deliberately different (§4b).
- The app shuffling, or deciding when the shuffle has gone on long enough.
- Claiming to predict the future, even in jest, in the letter or the copy.
- Breaking a returning user's saved book. Migration function on day one.

## 16. Footer credit

> *[fox mark]* — read by kind hands. Made by **CHΛOS**, 2026. It can't see the future. It just pays attention.
