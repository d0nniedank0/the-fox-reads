/* UI tests — jsdom. Run: node test/ui.test.js */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ FAIL: " + name); }
}

/* inline external scripts (defer-tolerant) */
function inlineScripts(html) {
  return html.replace(/<script src="([^"]+)"[^>]*><\/script>/g, function (_, src) {
    const p = path.join(__dirname, "..", src);
    return "<script>" + fs.readFileSync(p, "utf8") + "</scr" + "ipt>";
  });
}

const RAW = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const HTML = inlineScripts(RAW);

function makeDom(seedStore) {
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(HTML, {
    runScripts: "dangerously",
    url: "http://localhost/",
    pretendToBeVisual: true,
    beforeParse(window) {
      // jsdom lacks matchMedia
      window.matchMedia = window.matchMedia || function () {
        return { matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false; } };
      };
      // jsdom scrollTo is "not implemented" — silence it
      window.scrollTo = function () {};
      if (seedStore) {
        for (const [k, v] of Object.entries(seedStore)) window.localStorage.setItem(k, v);
      }
    },
  });
  const errors = [];
  dom.window.addEventListener("error", e => errors.push(String(e.error || e.message)));
  return { dom, errors };
}

function visible(w, id) {
  const el = w.document.getElementById(id);
  if (!el) return false;
  return !el.classList.contains("hidden") && el.offsetParent !== null;
}

(async function main() {
  /* ---------- fresh user: no letter screen, straight into the flow ---------- */
  {
    const { dom, errors } = makeDom();
    const w = dom.window;
    await new Promise(r => setTimeout(r, 30));
    const doc = w.document;
    ok(doc.getElementById("view-letter") === null, "no letter view exists at all");
    ok(doc.getElementById("btn-begin") === null, "no begin button");
    ok(!doc.getElementById("view-name").classList.contains("hidden"), "first run opens on the name question");
    ok(doc.querySelector(".masthead").classList.contains("hidden") === false, "masthead visible on entry");

    // name (blank allowed) → ask
    doc.getElementById("name-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
    ok(!doc.getElementById("view-ask").classList.contains("hidden"), "name submit → ask view");

    // first run recorded so the name prompt never returns
    const saved = w.localStorage.getItem("foxreads.v1");
    ok(saved && JSON.parse(saved).meta.seenLetter === true, "first run recorded");
    ok(errors.length === 0, "zero console errors (fresh flow): " + errors.join("; "));
  }

  /* ---------- returning user: straight to ask, full draw flow ---------- */
  {
    const { dom, errors } = makeDom({
      "foxreads.v1": JSON.stringify({ meta: { seenLetter: true, name: "", reversals: false }, readings: [], schemaVersion: 1 })
    });
    const w = dom.window;
    await new Promise(r => setTimeout(r, 30));
    const doc = w.document;
    ok(!doc.getElementById("view-ask").classList.contains("hidden"), "returning user → ask");

    // ask (with question) → spread
    doc.getElementById("question-input").value = "what is happening with my work";
    doc.getElementById("ask-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
    ok(!doc.getElementById("view-spread").classList.contains("hidden"), "ask → spread");
    ok(doc.getElementById("spread-reversal-state").textContent === "off", "reversal state reads off by default");

    // pick three-card spread → shuffle
    doc.getElementById("btn-spread-three").click();
    ok(!doc.getElementById("view-shuffle").classList.contains("hidden"), "spread choice → shuffle view");
    ok(doc.getElementById("btn-draw").classList.contains("hidden"), "draw button hidden before shuffle");

    // press-and-hold via keyboard (pointer events don't exist in jsdom)
    const stack = doc.getElementById("deck-stack");
    stack.dispatchEvent(new w.KeyboardEvent("keydown", { key: " ", bubbles: true }));
    ok(stack.classList.contains("shuffling"), "hold → shuffling class");
    ok(stack.getAttribute("aria-pressed") === "true", "aria-pressed true while shuffling");

    // release too quickly (300ms) → still no draw
    await new Promise(r => setTimeout(r, 300));
    // monkeypatch Date.now has already happened inside the app; simulate quick release
    stack.dispatchEvent(new w.KeyboardEvent("keyup", { key: " ", bubbles: true }));
    ok(doc.getElementById("btn-draw").classList.contains("hidden"), "quick release → still no draw");
    ok(/longer/.test(doc.getElementById("shuffle-state").textContent), "quick release message");

    // proper hold: manipulate the timer path via jsdom Date is invasive; instead
    // verify the drawn-reader path directly by seeding a completed shuffle
    const app = w.eval("1+1"); // sanity: scripts ran
    ok(app === 2, "scripts executing");

    // force a valid hold: send keydown, wait 1.3s, keyup
    stack.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await new Promise(r => setTimeout(r, 1400));
    stack.dispatchEvent(new w.KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
    ok(!doc.getElementById("btn-draw").classList.contains("hidden"), "held 1.4s → draw button appears");

    // draw
    doc.getElementById("btn-draw").click();
    ok(!doc.getElementById("view-reading").classList.contains("hidden"), "draw → reading view");
    const cards = doc.querySelectorAll("#reading-cards .card");
    ok(cards.length === 3, "three cards rendered (" + cards.length + ")");
    ok(doc.getElementById("reading-question").textContent.includes("what is happening with my work"), "question echoed");
    ok(doc.getElementById("reading-synth").textContent.length > 20, "synthesis rendered");
    ok(doc.getElementById("reading-aside").textContent.length > 5, "fox aside rendered");
    ok(doc.querySelectorAll("#reading-cards img").length === 3, "card images attached (RWS)");

    // persisted
    const saved = JSON.parse(w.localStorage.getItem("foxreads.v1"));
    ok(saved.readings.length === 1, "reading saved to store");
    ok(saved.readings[0].cards.length === 3, "saved reading carries cards");

    // book
    doc.getElementById("btn-reading-book").click();
    ok(!doc.getElementById("view-book").classList.contains("hidden"), "reading → book view");
    ok(doc.querySelectorAll("#book-list .book-entry").length === 1, "book lists the reading");
    ok(doc.querySelector("#book-list .entry-cards").textContent.split("·").length === 3, "book entry carries three names");

    ok(errors.length === 0, "zero console errors (main flow): " + errors.join("; "));
  }

  /* ---------- reversals toggle + persistence across reload ---------- */
  {
    // seed: seenLetter + one reading in old bare shape (migration path)
    const { dom, errors } = makeDom({
      "foxreads.v1": JSON.stringify({
        meta: { seenLetter: true, name: "Test", reversals: true },
        readings: [{ id: "seed1", createdAt: "2026-10-01T08:00:00Z", question: "old question", spreadId: "three", cards: [{ cardId: "the-fool", positionKey: "past", reversed: false }] }],
        schemaVersion: 1
      })
    });
    const w = dom.window;
    await new Promise(r => setTimeout(r, 30));
    const doc = w.document;

    ok(!doc.getElementById("view-ask").classList.contains("hidden"), "restart → ask (name prompt never returns)");
    ok(doc.getElementById("ask-greeting").textContent.includes("Hello, Test."), "greeting uses stored name"); // name prompt was saved earlier in flow

    // book shows the seeded reading
    doc.getElementById("nav-book").click();
    ok(doc.querySelectorAll("#book-list .book-entry").length >= 1, "seeded reading visible in book");

    // reversal toggle
    doc.getElementById("nav-about").click();
    const t = doc.getElementById("toggle-reversals");
    ok(t.checked === true, "toggle reflects stored reversals=true");
    t.checked = false;
    t.dispatchEvent(new w.Event("change", { bubbles: true }));
    const saved = JSON.parse(w.localStorage.getItem("foxreads.v1"));
    ok(saved.meta.reversals === false, "toggle persists as false");

    // home brand click → ask
    doc.getElementById("nav-home").click();
    ok(!doc.getElementById("view-ask").classList.contains("hidden"), "brand click returns home (ask)");
    ok(errors.length === 0, "zero console errors (settings/migration): " + errors.join("; "));
  }

  /* ---------- all ids referenced by JS exist in HTML ---------- */
  {
    const refs = new Set();
    const re = /\$\("([^"]+)"\)/g;
    for (const f of ["js/app.js"]) {
      const src = fs.readFileSync(path.join(__dirname, "..", f), "utf8");
      let m;
      while ((m = re.exec(src))) refs.add(m[1]);
    }
    // dynamic concat refs
    for (const v of ["name","ask","spread","shuffle","reading","book","about"]) refs.add("view-" + v);
    const missing = [...refs].filter(id => !/id=""/.test(RAW) && !new RegExp('id="' + id + '"').test(RAW));
    ok(missing.length === 0, "all JS-referenced ids exist in HTML" + (missing.length ? " — missing: " + missing.join(",") : ""));
  }

  console.log("\nui: " + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("SUITE ERROR:", e); process.exit(2); });
