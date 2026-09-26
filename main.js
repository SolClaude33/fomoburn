// Fomo Burn — launch config. Fill these in when the token goes live.
const TOKEN = {
  ticker: null,        // e.g. "$BURN"
  chain: null,         // e.g. "Solana"
  ca: null,            // contract address
  fomoUrl: null,       // the token's page on fomo.family (where theses are posted)
};

// Burn stats. Source: the token's fomo page (wiring TBD). null = not live yet.
const STATS = { theses: null, burned: null, supplyPct: null, burns: null };

// Social links. null = hidden.
const SOCIALS = { x: null, telegram: null };

// Burn receipts: one per thesis. Source: the token's fomo page (wiring TBD).
// Shape: { author, avatar, postedAt (ISO), thesis, burned (number), txUrl }
const RECEIPTS = [];

const fmt =new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, notation: "compact" });

function applyToken() {
  if (TOKEN.fomoUrl) {
    document.querySelectorAll("[data-fomo-link]").forEach((a) => (a.href = TOKEN.fomoUrl));
  }
  const btn = document.querySelector("[data-copy-ca]");
  if (TOKEN.ca && btn) {
    document.querySelector("[data-ca]").textContent = TOKEN.ca;
    btn.disabled = false;
    btn.addEventListener("click", async () => {
      const label = btn.querySelector("[data-copy-label]");
      try {
        await navigator.clipboard.writeText(TOKEN.ca);
        btn.classList.add("is-done");
        label.textContent = "Copied";
      } catch {
        label.textContent = "Press Ctrl+C";
      }
      setTimeout(() => { btn.classList.remove("is-done"); label.textContent = "Copy"; }, 1800);
    });
  }
}

function applyStats() {
  const live = Object.values(STATS).some((v) => v !== null);
  for (const [key, value] of Object.entries(STATS)) {
    const el = document.querySelector(`[data-stat="${key}"]`);
    if (!el || value === null) continue;
    el.textContent = key === "supplyPct" ? `${value.toFixed(2)}%` : fmt.format(value);
  }
  if (live) document.querySelector("[data-stats-note]").lastChild.textContent = "Live · data from the token's fomo page";
}

function applyLedger() {
  const list = document.querySelector("[data-ledger]");
  const tpl = document.getElementById("receipt-tpl");
  if (!RECEIPTS.length) return; // empty state stays visible
  document.querySelector("[data-ledger-empty]").hidden = true;
  const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  for (const r of RECEIPTS) {
    const node = tpl.content.cloneNode(true);
    node.querySelector(".receipt__name").textContent = r.author;
    if (r.avatar) node.querySelector(".receipt__avatar").style.backgroundImage = `url("${r.avatar}")`;
    const time = node.querySelector(".receipt__time");
    time.dateTime = r.postedAt;
    time.textContent = dateFmt.format(new Date(r.postedAt));
    node.querySelector(".receipt__thesis").textContent = r.thesis;
    node.querySelector(".receipt__amount").textContent = `${fmt.format(r.burned)} ${TOKEN.ticker ?? "tokens"}`;
    const tx = node.querySelector(".receipt__tx");
    if (r.txUrl) tx.href = r.txUrl; else tx.remove();
    list.append(node);
  }
}

function applyMeta() {
  for (const [key, url] of Object.entries(SOCIALS)) {
    const a = document.querySelector(`[data-social="${key}"]`);
    if (a && url) { a.href = url; a.hidden = false; }
  }
}

applyToken();
applyStats();
applyLedger();
applyMeta();

/* ───────── motion ───────── */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

// Nav turns solid once the page scrolls.
const nav = document.querySelector("[data-nav]");
const onScrollNav = () => nav.classList.toggle("is-scrolled", scrollY > 24);
onScrollNav();
addEventListener("scroll", onScrollNav, { passive: true });

// "burns": split into letters so the heat ripples across them.
const burnWord = document.querySelector("[data-burn-word]");
if (burnWord && !reduceMotion) {
  const text = burnWord.textContent;
  burnWord.setAttribute("aria-label", text);
  burnWord.innerHTML = [...text].map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${c}</span>`).join("");
}

// Scroll reveals.
const revealables = document.querySelectorAll(".rv, [data-ledger-empty]");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add("is-in"));
}

// Scroll-driven: hero parallax, the fuse in "How it works", soft parallax on the astronaut.
const earth = document.querySelector("[data-parallax]");
const soft = document.querySelector("[data-parallax-soft]");
const fuseSection = document.querySelector("[data-fuse-section]");
const steps = [...document.querySelectorAll("[data-step]")];
let ticking = false;
function onScrollFx() {
  ticking = false;
  const vh = innerHeight;
  if (earth && scrollY < vh * 1.2) earth.style.transform = `translateY(${scrollY * 0.28}px) scale(${1 + scrollY / vh * 0.06})`;
  if (soft) {
    const r = soft.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) soft.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * -0.08}px)`;
  }
  if (fuseSection) {
    const r = fuseSection.getBoundingClientRect();
    // 0 when the section top reaches 75% of the viewport, 1 when it's 15% from the top
    const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (vh * 0.6)));
    fuseSection.style.setProperty("--p", p.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle("is-lit", p >= (i + 0.5) / steps.length - 0.02));
  }
}
if (!reduceMotion) {
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
  onScrollFx();
} else {
  steps.forEach((s) => s.classList.add("is-lit"));
  fuseSection?.style.setProperty("--p", "1");
}

// Logo follows the pointer a little.
const tilt = document.querySelector("[data-tilt]");
if (tilt && finePointer && !reduceMotion) {
  addEventListener("pointermove", (e) => {
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    tilt.style.transform = `translate(${x * 18}px, ${y * 12}px) rotate(${x * 6}deg)`;
  }, { passive: true });
}

// Sparks rising off the burning horizon (canvas). Parallelogram embers, like the mark's counters.
const canvas = document.querySelector("[data-sparks]");
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext("2d");
  const colors = ["#ff4d1f", "#ffb021", "#ff6a3d", "#ffd27a"];
  let w, h, dpr, sparks = [], running = true, mouseX = 0.5;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const count = () => Math.round(Math.min(90, w / 16));
  const spawn = (initial) => ({
    x: Math.random() * w,
    y: initial ? h * (0.35 + Math.random() * 0.65) : h * (0.62 + Math.random() * 0.4),
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(0.35 + Math.random() * 1.1),
    s: 2 + Math.random() * 4.5,
    life: 0, max: 220 + Math.random() * 260,
    c: colors[(Math.random() * colors.length) | 0],
    wob: Math.random() * Math.PI * 2,
  });
  const skew = Math.tan(-10.8 * Math.PI / 180);
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const drift = (mouseX - 0.5) * 0.6;
    for (let i = 0; i < sparks.length; i++) {
      const p = sparks[i];
      p.life++; p.wob += 0.04;
      p.x += p.vx + Math.sin(p.wob) * 0.25 + drift; p.y += p.vy;
      const t = p.life / p.max;
      if (t >= 1 || p.y < -10) { sparks[i] = spawn(false); continue; }
      ctx.globalAlpha = Math.sin(Math.PI * t) * 0.9;
      ctx.fillStyle = p.c;
      ctx.setTransform(dpr, 0, skew * dpr, dpr, p.x * dpr, p.y * dpr);
      ctx.fillRect(-p.s, -p.s * 0.35, p.s * 2, p.s * 0.7 + 1);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  size();
  sparks = Array.from({ length: count() }, () => spawn(true));
  addEventListener("resize", () => { size(); sparks.length = Math.min(sparks.length, count()); while (sparks.length < count()) sparks.push(spawn(true)); });
  if (finePointer) addEventListener("pointermove", (e) => { mouseX = e.clientX / innerWidth; }, { passive: true });
  // pause when the hero is off-screen
  new IntersectionObserver(([e]) => {
    const was = running; running = e.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(canvas);
  requestAnimationFrame(frame);
}
