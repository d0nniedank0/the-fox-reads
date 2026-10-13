# The Fox Reads

A fox reads your cards for you. You ask a real question, you shuffle it yourself, and you get an honest reading you can keep.

Built as a gift for a friend who reads tarot, and left open for anyone else.

## How it works

1. A letter from the author (first run only).
2. It asks what to call you. Nothing leaves the page.
3. Ask — a real question, optional but weaker without.
4. Pick a spread: one card (today), three (past/present/future), five (the decision spread).
5. **You shuffle.** Press and hold the deck. The app never shuffles for you and never decides when to stop — the draw button appears only when your own hand has held long enough.
6. The reading: Rider–Waite–Smith scans, each card's meaning written in the author's voice, a synthesis of the set, and one oblique line from the fox.
7. The book — every reading kept locally, newest first.

Reversals are opt-in (About → settings). no-repeat draws: the fox doesn't repeat a card until the deck has been fully read through, then it reshuffles.

## Privacy & stack

- Static single page, no backend, no accounts, no analytics.
- Your readings live in your browser's `localStorage` only. Clearing site data clears the book.
- No LLM at runtime — all interpretation text is authored.

## Card images

The Rider–Waite–Smith tarot (Pamela Colman Smith, 1909) is in the **public domain** (US: pre-1930 publication; UK/EU: Smith died 1951). Scan files sourced via Wikimedia Commons; the fox is original.

## Structure

```
index.html        markup + hub-meta head
css/styles.css    the night shrine (indigo ground, paper panels, vermilion accent)
js/engine.js      DOM-free engine: deck, spreads, seeded draw, asides, synthesis, migration
js/app.js         UI layer, views, shuffle ritual, storage
assets/           fox (night/paper variants) + 22 RWS scans + manifest
test/             node engine tests + jsdom UI tests
```

## Running the tests

```bash
npm i          # once (jsdom)
node test/engine.test.js
node test/ui.test.js
```

## Viewing locally

```bash
npx http-server -p 8080     # or any static server
# → http://localhost:8080
```

---

*It can't see the future. It just pays attention.*

Made by **CHΛOS**, 2026.
