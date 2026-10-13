"use strict";

/* ==========================================================================
   The Fox Reads — UI layer
   Views: name → ask → spread → shuffle → reading → book / about
   Engine (js/engine.js) is DOM-free; all DOM work happens here.
   ========================================================================== */

if (typeof document !== "undefined") {
  (function () {

    var $ = function (id) { return document.getElementById(id); };

    /* ---------- state ---------- */
    var STORE_KEY = "foxreads.v1";
    var state = {
      meta: { seenLetter: false, name: "", reversals: false },
      readings: [],        // newest last internally; rendered newest-first
      cycleOrder: null     // remaining deck for the current cycle
    };

    function loadStore() {
      var raw = null;
      try { raw = window.localStorage.getItem(STORE_KEY); } catch (e) { raw = null; }
      if (!raw) return;
      try {
        var parsed = JSON.parse(raw);
        var migrated = engine.migrateStore(parsed);
        state.readings = migrated.readings;
        state.meta = migrated.meta && typeof migrated.meta === "object" ? migrated.meta : state.meta;
        if (typeof state.meta.reversals !== "boolean") state.meta.reversals = false;
        if (typeof state.meta.seenLetter !== "boolean") state.meta.seenLetter = false;
        if (typeof state.meta.name !== "string") state.meta.name = "";
      } catch (e) { /* corrupt store → fresh start, worst case a lost book */ }
    }

    function saveStore() {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify({
          meta: state.meta,
          readings: state.readings,
          schemaVersion: engine.SCHEMA_VERSION
        }));
      } catch (e) { /* storage full/blocked: the reading still displays */ }
    }

    /* ---------- view switching ---------- */
    var VIEWS = ["name", "ask", "spread", "shuffle", "reading", "book", "about"];

    function showView(name) {
      for (var i = 0; i < VIEWS.length; i++) {
        var el = $("view-" + VIEWS[i]);
        if (el) el.classList.toggle("hidden", VIEWS[i] !== name);
      }
      try { window.scrollTo(0, 0); } catch (e) { /* jsdom */ }

      if (name === "book") renderBook();
      if (name === "about") syncReversalToggle();
      if (name === "spread") syncSpreadReversalNote();
      if (name === "ask") syncGreeting();
    }

    /* ---------- name ---------- */

    function firstName() {
      var n = (state.meta.name || "").trim();
      return n.split(/\s+/)[0] || "";
    }

    /* the app opens on the ask view; a first-time visitor meets the name
       prompt first (it is itself the first question the fox asks). */
    function homeView() {
      return state.meta.seenLetter ? "ask" : "name";
    }

    /* ---------- greeting ---------- */
    function timeGreeting(now) {
      var h = (now || new Date()).getHours();
      if (h < 5) return "Still up.";
      if (h < 12) return "Good morning.";
      if (h < 18) return "Good afternoon.";
      return "Good evening.";
    }

    /* greeting shown on the ask view: named if we have one, else by hour */
    function syncGreeting() {
      var g = $("ask-greeting");
      if (!g) return;
      g.textContent = firstName()
        ? "Hello, " + firstName() + "."
        : timeGreeting();
    }

    /* ---------- ask ---------- */
    function currentQuestion(defaultText) {
      var el = $("question-input");
      if (!el) return defaultText || "";
      return el.value.trim();
    }

    /* ---------- spread ---------- */
    function spreadById(id) {
      for (var i = 0; i < engine.SPREADS.length; i++) {
        if (engine.SPREADS[i].id === id) return engine.SPREADS[i];
      }
      return engine.SPREADS[1]; // three — never silently wrong
    }

    function syncSpreadReversalNote() {
      var el = $("spread-reversal-state");
      if (el) el.textContent = state.meta.reversals ? "on" : "off";
    }

    /* ---------- shuffle (hold to riffle) ---------- */
    var shuffle = {
      start: 0,
      timer: null,
      active: false,
      hold: false
    };

    function beginHold(e) {
      if (shuffle.active) return;
      e.preventDefault();
      shuffle.active = true;
      shuffle.hold = true;
      shuffle.start = Date.now();
      var stack = $("deck-stack");
      stack.classList.add("shuffling");
      stack.setAttribute("aria-pressed", "true");
      $("shuffle-state").textContent = "shuffling…";
      $("btn-draw").classList.add("hidden");
      // tick the state line while they hold
      var phrases = [
        "shuffling…", "still shuffling…", "the cards are settling…",
        "waiting on you…", "whenever it feels like time…", "the fox is watching…"
      ];
      var i = 0;
      shuffle.timer = window.setInterval(function () {
        i = Math.min(i + 1, phrases.length - 1);
        $("shuffle-state").textContent = phrases[i];
      }, 4000);
    }

    function endHold(e) {
      if (!shuffle.hold) return;
      shuffle.hold = false;
      if (shuffle.timer) { window.clearInterval(shuffle.timer); shuffle.timer = null; }
      var stack = $("deck-stack");
      stack.classList.remove("shuffling");
      stack.setAttribute("aria-pressed", "false");
      var heldMs = Date.now() - shuffle.start;
      shuffle.active = false;

      if (heldMs < 1200) {
        $("shuffle-state").textContent = "longer. the question needs holding.";
        return; // not enough — no draw button yet
      }
      shuffle.heldMs = heldMs;
      shuffle.rngSeed = Math.floor(Math.random() * 4294967296);
      $("shuffle-state").textContent = "the deck is done. your hand stopped it.";
      $("btn-draw").classList.remove("hidden");
      $("btn-draw").focus();
    }

    /* ---------- reading ---------- */
    function cardById(id) {
      for (var i = 0; i < engine.CARDS.length; i++) {
        if (engine.CARDS[i].id === id) return engine.CARDS[i];
      }
      return null;
    }

    function renderReading(reading) {
      var spread = spreadById(reading.spreadId);

      // header
      var d = new Date(reading.createdAt);
      var dateStr = d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
      $("reading-date").textContent = dateStr;
      var q = reading.question.trim();
      $("reading-question").textContent = q
        ? "\u201C" + q + "\u201D"
        : "(no question — the fox read anyway)";

      // cards
      var wrap = $("reading-cards");
      wrap.innerHTML = "";
      for (var i = 0; i < reading.cards.length; i++) {
        var c = reading.cards[i];
        var card = cardById(c.cardId);
        var pos = null;
        for (var p = 0; p < spread.positions.length; p++) {
          if (spread.positions[p].key === c.positionKey) pos = spread.positions[p];
        }
        var node = document.createElement("article");
        node.className = "card" + (c.reversed ? " reversed" : "");
        node.setAttribute("data-card-id", c.cardId);

        var img = document.createElement("img");
        img.src = card.img;
        img.alt = card.name + " tarot card" + (c.reversed ? ", reversed" : "");
        node.appendChild(img);

        var body = document.createElement("div");
        body.className = "card-body";

        var nameEl = document.createElement("h3");
        nameEl.className = "card-name";
        nameEl.innerHTML = "";
        nameEl.appendChild(document.createTextNode(card.name + " "));
        var ori = document.createElement("span");
        ori.className = "card-orientation";
        ori.textContent = c.reversed ? "(reversed)" : "(upright)";
        nameEl.appendChild(ori);
        body.appendChild(nameEl);

        if (pos) {
          var posEl = document.createElement("p");
          posEl.className = "card-pos";
          posEl.textContent = pos.framing;
          body.appendChild(posEl);
        }

        var textEl = document.createElement("p");
        textEl.className = "card-verdict";
        textEl.textContent = c.reversed ? card.reversed : card.upright;
        body.appendChild(textEl);

        node.appendChild(body);
        wrap.appendChild(node);
      }

      // synthesis — labelled movements, each a different kind of claim.
      // The memory line is already frozen on the reading (it reads the book,
      // not the cards), so it is passed through rather than recomputed.
      var syn = engine.synthesize({
        spread: spread,
        cards: reading.cards.map(function (c) {
          return { cardId: c.cardId, reversed: c.reversed, positionKey: c.positionKey };
        })
      });
      syn.memory = reading.memory || "";
      renderSynthesis(syn);

      // fox aside
      $("reading-aside").textContent = reading.foxAside || "";
    }

    /* the movements, in the order the reading makes them */
    var MOVEMENTS = [
      { key: "memory",  label: "Since last time" },
      { key: "set",     label: "The set" },
      { key: "tension", label: "Where they pull" },
      { key: "turn",    label: "The turn" },
      { key: "ask",     label: "What it asks" }
    ];

    function renderSynthesis(syn) {
      var wrap = $("reading-synth");
      if (!wrap) return;
      wrap.innerHTML = "";
      if (!syn) return;
      for (var i = 0; i < MOVEMENTS.length; i++) {
        var m = MOVEMENTS[i];
        var text = syn[m.key];
        if (!text) continue;
        var block = document.createElement("div");
        block.className = "movement";
        var lab = document.createElement("p");
        lab.className = "movement-label";
        lab.textContent = m.label;
        var body = document.createElement("p");
        body.className = "synth";
        body.textContent = text;
        block.appendChild(lab);
        block.appendChild(body);
        wrap.appendChild(block);
      }
    }

    function doDraw() {
      var spread = spreadById(state.pendingSpread || "three");
      var rng = engine.mulberry32(shuffle.rngSeed || Date.now());
      var question = typeof state.pendingQuestion === "string" ? state.pendingQuestion : "";
      var reading = engine.drawReading({
        spread: spread,
        rng: rng,
        now: new Date().toISOString(),
        question: question,
        reversalsEnabled: !!state.meta.reversals,
        order: state.cycleOrder ? state.cycleOrder.slice() : null
      });

      var history = state.readings.slice();
      reading.foxAside = engine.foxAside({
        question: reading.question,
        rng: rng
      });
      // Resolved against the book as it stood BEFORE this reading, then frozen
      // onto the reading — a re-render must never recompute it against a book
      // that now contains this drawing.
      reading.memory = engine.crossReading({ cards: reading.cards, history: history }) || "";

      state.cycleOrder = reading.remaining && reading.remaining.length ? reading.remaining : null;
      state.readings.push(reading);
      saveStore();
      renderReading(reading);
      showView("reading");
    }

    /* ---------- book ---------- */
    function renderBook() {
      var list = $("book-list");
      list.innerHTML = "";
      var readings = state.readings.slice().reverse();

      $("book-lede").textContent = readings.length
        ? "Everything the fox has read for you, newest first."
        : "Nothing here yet. The fox is waiting.";

      if (!readings.length) {
        var empty = document.createElement("p");
        empty.className = "book-entry book-entry-empty";
        empty.textContent = "Your readings will be kept here — question, cards, date. After a few, patterns start showing up.";
        list.appendChild(empty);
        return;
      }

      for (var i = 0; i < readings.length; i++) {
        var r = readings[i];
        var entry = document.createElement("article");
        entry.className = "book-entry";

        var dateEl = document.createElement("p");
        dateEl.className = "entry-date";
        var d = new Date(r.createdAt);
        var name = firstName();
        dateEl.textContent = (name ? name + " — " : "") + d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

        var qEl = document.createElement("p");
        qEl.className = "entry-question";
        qEl.textContent = r.question ? "\u201C" + r.question + "\u201D" : "(no question — read anyway)";

        var cardsEl = document.createElement("p");
        cardsEl.className = "entry-cards";
        cardsEl.textContent = r.cards.map(function (c) {
          var card = cardById(c.cardId);
          return card ? card.name + (c.reversed ? " rev." : "") : "?";
        }).join(" · ");

        entry.appendChild(dateEl);
        entry.appendChild(qEl);
        entry.appendChild(cardsEl);
        list.appendChild(entry);
      }
    }

    /* ---------- about ---------- */
    function syncReversalToggle() {
      var t = $("toggle-reversals");
      if (t) t.checked = !!state.meta.reversals;
    }

    /* ---------- wiring ---------- */
    function boot() {
      loadStore();

      // brand mark → home
      var navHome = $("nav-home");
      navHome.addEventListener("click", function () {
        showView(homeView());
      });

      // nav
      $("nav-book").addEventListener("click", function () { showView("book"); });
      $("nav-about").addEventListener("click", function () { showView("about"); });

      // name
      $("name-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var v = $("name-input").value.trim();
        state.meta.name = v.slice(0, 40);
        state.meta.seenLetter = true;   // first run is complete from here
        saveStore();
        var g = $("ask-greeting");
        g.textContent = firstName() ? "Hello, " + firstName() + "." : timeGreeting();
        showView("ask");
      });

      // ask
      $("ask-form").addEventListener("submit", function (e) {
        e.preventDefault();
        state.pendingQuestion = $("question-input").value.trim().slice(0, 280);
        showView("spread");
      });

      // spread choices
      var choices = document.querySelectorAll(".spread-choice");
      for (var i = 0; i < choices.length; i++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            state.pendingSpread = btn.getAttribute("data-spread");
            // reset shuffle state for this reading
            shuffle.heldMs = null;
            shuffle.rngSeed = null;
            $("shuffle-state").textContent = "\u2026";
            $("btn-draw").classList.add("hidden");
            showView("shuffle");
          });
        })(choices[i]);
      }
      $("spread-about-link").addEventListener("click", function () { showView("about"); });

      // shuffle: press-and-hold (mouse, touch, keyboard)
      var stack = $("deck-stack");
      stack.addEventListener("pointerdown", beginHold);
      window.addEventListener("pointerup", endHold);
      window.addEventListener("pointercancel", endHold);
      stack.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); beginHold(e); }
      });
      stack.addEventListener("keyup", function (e) {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); endHold(e); }
      });

      $("btn-draw").addEventListener("click", doDraw);

      // reading actions
      $("btn-reading-again").addEventListener("click", function () {
        var g = $("ask-greeting");
        g.textContent = firstName() ? "Again, " + firstName() + "." : timeGreeting();
        showView("ask");
      });
      $("btn-reading-book").addEventListener("click", function () { showView("book"); });

      // book
      $("btn-book-ask").addEventListener("click", function () {
        var g = $("ask-greeting");
        g.textContent = firstName() ? "Hello again, " + firstName() + "." : timeGreeting();
        showView("ask");
      });

      // about
      $("btn-about-back").addEventListener("click", function () {
        showView(homeView());
      });
      $("toggle-reversals").addEventListener("change", function (e) {
        state.meta.reversals = e.target.checked;
        saveStore();
        syncSpreadReversalNote();
      });

      // boot view — no letter screen any more; straight into the reading flow
      showView(homeView());
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  })();
}
