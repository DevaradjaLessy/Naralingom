/* =========================================================
   Temple Sinapouralé Naral-UnGom — scripts du site
   ========================================================= */

/* ---------- Configuration à compléter par le temple ---------- */
const TEMPLE = {
  // Adresse qui reçoit les demandes d'adhésion (ex. "contact@mon-temple.re").
  email: "",

  // Prochaines dates au temple. Les dates passées sont masquées automatiquement.
  // Format : { date: "AAAA-MM-JJ", titre: "…", detail: "…" }
  agenda: [
    // { date: "2027-01-23", titre: "Thaipoosam Cavadee", detail: "Départ de la procession à 6 h" },
  ],

  // Pluie de fleurs à l'ouverture des pages (false pour la désactiver).
  fleurs: true,
};

/* ---------- Menu mobile ---------- */
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("menu");

function setMenu(open) {
  navToggle.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
  navToggle.querySelector(".sr-only").textContent = open ? "Fermer le menu" : "Ouvrir le menu";
}

navToggle.addEventListener("click", () => {
  setMenu(navToggle.getAttribute("aria-expanded") !== "true");
});

nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) {
    setMenu(false);
    navToggle.focus();
  }
});

/* ---------- Lien actif selon la section visible ---------- */
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

/* ---------- Agenda du temple ---------- */
(function renderAgenda() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = TEMPLE.agenda
    .map((ev) => ({ ...ev, when: new Date(`${ev.date}T00:00:00`) }))
    .filter((ev) => !Number.isNaN(ev.when.getTime()) && ev.when >= today)
    .sort((a, b) => a.when - b.when);

  const list = document.getElementById("agenda-list");
  if (!list || !upcoming.length) return;

  const fmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  upcoming.forEach((ev) => {
    const li = document.createElement("li");
    const date = document.createElement("span");
    date.className = "agenda-date";
    date.textContent = fmt.format(ev.when);
    const label = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = ev.titre;
    label.append(title);
    if (ev.detail) label.append(` — ${ev.detail}`);
    li.append(date, label);
    list.append(li);
  });

  document.getElementById("agenda").hidden = false;
})();

/* ---------- L'examen du soir des 3V ---------- */
(function threeV() {
  const form = document.getElementById("v-check");
  const out = document.getElementById("v-result");
  if (!form) return;
  const messages = [
    "Chaque jour est une nouvelle chance. Allumez une lampe et recommencez demain.",
    "Un premier pas. Demain, gardez une porte de plus.",
    "Deux portes gardées sur trois : la lumière grandit.",
    "Les trois portes sont gardées. Que cette paix vous accompagne. Vanakkam.",
  ];

  form.addEventListener("change", () => {
    const count = form.querySelectorAll("input:checked").length;
    out.textContent = messages[count];
  });
})();

/* ---------- Demande d'adhésion ---------- */
(function joinForm() {
  const form = document.getElementById("join-form");
  const status = document.getElementById("join-status");
  if (!form) return;

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = `form-status ${kind ? `is-${kind}` : ""}`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let firstInvalid = null;
    form.querySelectorAll("[required], input[type=email]").forEach((field) => {
      const invalid = !field.checkValidity();
      field.setAttribute("aria-invalid", String(invalid));
      if (invalid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      setStatus("Merci d'indiquer au moins votre nom et votre téléphone.", "error");
      firstInvalid.focus();
      return;
    }

    if (!TEMPLE.email) {
      setStatus("Les demandes en ligne ouvriront bientôt. En attendant, appelez le temple au 0693 48 62 95.", "error");
      return;
    }

    const data = new FormData(form);
    const body = [
      `Nom : ${data.get("nom")}`,
      `Téléphone : ${data.get("tel")}`,
      `E-mail : ${data.get("email") || "—"}`,
      `Commune : ${data.get("commune") || "—"}`,
      "",
      `${data.get("message") || ""}`,
    ].join("\n");

    const subject = "Demande d'adhésion au temple";
    window.location.href =
      `mailto:${TEMPLE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Votre messagerie va s'ouvrir pour envoyer la demande. Merci !", "ok");
  });
})();

/* ---------- Filtres de la page Actualités ---------- */
(function newsFilters() {
  const buttons = [...document.querySelectorAll(".filter[data-filter]")];
  if (!buttons.length) return;
  const items = [...document.querySelectorAll(".news-list [data-cat]")];

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      items.forEach((item) => {
        item.hidden = cat !== "toutes" && item.dataset.cat !== cat;
      });
    });
  });
})();

/* ---------- Copier le lien d'un article ---------- */
document.querySelectorAll("[data-copy-link]").forEach((btn) => {
  const label = btn.textContent;
  btn.addEventListener("click", () => {
    const done = (text) => {
      btn.textContent = text;
      setTimeout(() => { btn.textContent = label; }, 2500);
    };
    if (!navigator.clipboard) {
      done("Copie impossible, utilisez la barre d'adresse");
      return;
    }
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => done("Lien copié"))
      .catch(() => done("Copie impossible, utilisez la barre d'adresse"));
  });
});

/* ---------- Accueil en fleurs : பூ மழை (poo mazhai) ----------
   Comme on lance des fleurs pour accueillir une divinité ou un invité.
   Page d'accueil : comme au moment de l'arati, quand on tire le voile du
   sanctuaire (திரை, thirai), la page s'assombrit, le Om d'or apparaît dans
   un halo, puis le voile se lève dans une gerbe de pétales et d'étincelles
   et une pluie de fleurs prend le relais.
   Autres pages : la pluie de fleurs seule, plus légère.
   Le tout s'efface en quelques secondes et ne bloque jamais la page. */
(function flowerShower() {
  if (!TEMPLE.fleurs) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;
  canvas.className = "flower-shower";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);

  const isHome = Boolean(document.getElementById("hero-title"));
  const DURATION = isHome ? 6200 : 4500; // ms, fondu compris
  const FADE_OUT = 1300;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const easeOutBack = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
  const KINDS = ["souci", "souci", "souci", "souci", "souci", "jasmin", "jasmin", "jasmin", "rose", "rose", "guirlande"];
  const COLORS = {
    souci: ["#f59e0b", "#e8871e", "#f6c453", "#f2a516"],
    rose: ["#b3202a", "#c8324a", "#9c1b2b"],
  };
  const GOLD = ["#fff3b0", "#ffe08a", "#f6c453", "#ffd56b"];
  const GRAVITY = 520; // px/s²

  /* --- Particules --- */
  const petals = [];
  const sparks = [];

  function makePetal(x, y, vx, vy, delay) {
    const kind = pick(KINDS);
    petals.push({
      kind,
      color: COLORS[kind] ? pick(COLORS[kind]) : null,
      size: { jasmin: rand(7, 11), guirlande: rand(10, 15) }[kind] || rand(8, 14),
      x, y, vx, vy,
      delay,
      terminal: rand(0.15, 0.28) * H,
      sway: rand(14, 42),
      freq: rand(1.2, 2.6),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-3, 3),
      flip: rand(0, Math.PI * 2),
      vflip: rand(2, 6),
    });
  }

  // Pluie depuis le haut de l'écran
  const rainCount = Math.round(Math.min(isHome ? 150 : 90, Math.max(45, W / (isHome ? 8 : 12))));
  const rainDelay = isHome ? 1100 : 0;
  for (let i = 0; i < rainCount; i += 1) {
    makePetal(rand(0, W), rand(-0.7, 0.05) * H, rand(-20, 20), rand(0.15, 0.28) * H, rainDelay + rand(0, 900));
  }

  /* --- Le Om d'or (page d'accueil) --- */
  const om = { img: null, start: 0, burst: isHome ? 1200 : Infinity };
  const omCx = () => W / 2;
  const omCy = () => H * 0.45;
  const omSize = () => Math.min(W, H) * 0.34;

  function burst() {
    const cx = omCx();
    const cy = omCy();
    const n = Math.round(Math.min(110, Math.max(60, W / 12)));
    const reach = Math.max(W, H);
    for (let i = 0; i < n; i += 1) {
      const a = rand(0, Math.PI * 2);
      const speed = rand(0.35, 0.95) * reach;
      makePetal(cx, cy, Math.cos(a) * speed, Math.sin(a) * speed - rand(0.1, 0.35) * reach, 0);
    }
    for (let i = 0; i < 70; i += 1) {
      const a = rand(0, Math.PI * 2);
      const speed = rand(0.1, 0.6) * reach;
      sparks.push({
        x: cx, y: cy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        life: rand(0.7, 1.6), age: 0, size: rand(1.8, 4), color: pick(GOLD), tw: rand(8, 16),
      });
    }
  }

  if (isHome) {
    const src = document.currentScript && document.currentScript.src;
    const img = new Image();
    img.onload = () => {
      // Om teinté d'or sur un canvas intermédiaire
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const o = off.getContext("2d");
      o.drawImage(img, 0, 0);
      o.globalCompositeOperation = "source-in";
      const g = o.createLinearGradient(0, 0, 0, off.height);
      g.addColorStop(0, "#fff6c7");
      g.addColorStop(0.45, "#f6c453");
      g.addColorStop(1, "#d98e1b");
      o.fillStyle = g;
      o.fillRect(0, 0, off.width, off.height);
      om.img = off;
    };
    img.src = src ? new URL("../img/favicon-512.png", src).href : "assets/img/favicon-512.png";
  }

  /* --- Dessins --- */
  function drawPetal(p) {
    const s = p.size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.45, s * 0.6, s * 0.85, 0, s);
    ctx.bezierCurveTo(-s * 0.6, s * 0.85, -s * 0.95, -s * 0.45, 0, -s);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(90, 20, 10, .25)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(0, s * 0.7);
    ctx.stroke();
  }

  function drawJasmine(p) {
    const s = p.size;
    ctx.fillStyle = "#fffdf6";
    ctx.strokeStyle = "rgba(150, 110, 40, .5)";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.62, s * 0.36, s * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = "#f6d36b";
    ctx.fill();
  }

  // Fleur de souci entière, comme sur les guirlandes du temple
  function drawMarigold(p) {
    const s = p.size;
    const rings = [
      { n: 14, r: s * 0.78, w: s * 0.3, h: s * 0.42, color: "#e8871e" },
      { n: 10, r: s * 0.48, w: s * 0.26, h: s * 0.34, color: "#f59e0b" },
      { n: 7, r: s * 0.22, w: s * 0.2, h: s * 0.26, color: "#f6c453" },
    ];
    for (const ring of rings) {
      ctx.fillStyle = ring.color;
      for (let i = 0; i < ring.n; i += 1) {
        const a = (i * Math.PI * 2) / ring.n;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * ring.r, Math.sin(a) * ring.r, ring.w, ring.h, a + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawSpark(sp) {
    const k = sp.age / sp.life;
    const alpha = Math.sin(Math.PI * k) * (0.6 + 0.4 * Math.sin(sp.age * sp.tw));
    const r = sp.size * (1 - k * 0.5);
    ctx.save();
    ctx.globalAlpha *= Math.max(0, alpha);
    ctx.translate(sp.x, sp.y);
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.moveTo(0, -r * 2.2);
    ctx.quadraticCurveTo(0, 0, r * 2.2, 0);
    ctx.quadraticCurveTo(0, 0, 0, r * 2.2);
    ctx.quadraticCurveTo(0, 0, -r * 2.2, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r * 2.2);
    ctx.fill();
    ctx.restore();
  }

  function drawOm(t) {
    if (!om.img) return;
    if (!om.start) om.start = t;
    const k = t - om.start;
    const cx = omCx();
    const cy = omCy();
    const size = omSize();
    let scale;
    let alpha;
    if (k < 600) {
      scale = 0.55 + 0.45 * easeOutBack(k / 600);
      alpha = Math.min(1, k / 350);
    } else if (k < 950) {
      scale = 1;
      alpha = 1;
    } else if (k < 1500) {
      const e = (k - 950) / 550;
      scale = 1 + 0.35 * e;
      alpha = 1 - e;
    } else {
      return;
    }

    // Halo de lumière, comme la flamme de l'arati
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.25 * scale);
    halo.addColorStop(0, `rgba(255, 238, 170, ${0.75 * alpha})`);
    halo.addColorStop(0.45, `rgba(246, 196, 83, ${0.35 * alpha})`);
    halo.addColorStop(1, "rgba(246, 196, 83, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(cx - size * 1.6, cy - size * 1.6, size * 3.2, size * 3.2);

    const w = size * scale;
    const h = w * (om.img.height / om.img.width);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.shadowColor = "rgba(255, 200, 80, .9)";
    ctx.shadowBlur = 36;
    ctx.drawImage(om.img, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
  }

  function drawShockwave(t) {
    const k = (t - om.burst) / 800;
    if (k < 0 || k > 1) return;
    const r = omSize() * 0.4 + k * Math.max(W, H) * 0.75;
    ctx.save();
    ctx.globalAlpha *= 1 - k;
    ctx.strokeStyle = "#f6c453";
    ctx.lineWidth = 6 * (1 - k) + 1;
    ctx.beginPath();
    ctx.arc(omCx(), omCy(), r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /* --- Animation --- */
  const start = performance.now();
  let last = start;
  let burstDone = false;

  function frame(now) {
    const t = now - start;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Si le Om n'a pas pu se charger à temps, la gerbe part quand même.
    if (isHome && !burstDone) {
      if (om.start) om.burst = om.start + 950;
      else if (t > 900) om.burst = t;
      if (t >= om.burst) {
        burst();
        burstDone = true;
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = Math.max(0, Math.min(1, (DURATION - t) / FADE_OUT));

    if (isHome) {
      // Voile du sanctuaire : se pose aussitôt, se lève au moment de la gerbe
      const veil = burstDone
        ? 0.6 * Math.max(0, 1 - (t - om.burst) / 700)
        : 0.6 * Math.min(1, t / 250);
      if (veil > 0) {
        ctx.fillStyle = `rgba(43, 8, 14, ${veil})`;
        ctx.fillRect(0, 0, W, H);
      }
      drawOm(t);
      drawShockwave(t);
    }

    for (const p of petals) {
      if (t < p.delay) continue;
      p.vx -= p.vx * 1.4 * dt;
      p.vy = Math.min(p.vy + GRAVITY * dt, p.terminal);
      p.x += (p.vx + Math.sin((t / 1000) * p.freq + p.phase) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.flip += p.vflip * dt;
      if (p.y > H + 30 || p.x < -60 || p.x > W + 60) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const squash = p.kind === "guirlande" ? 0.75 : 0.35;
      ctx.scale(squash + (1 - squash) * Math.abs(Math.cos(p.flip)), 1);
      if (p.kind === "jasmin") drawJasmine(p);
      else if (p.kind === "guirlande") drawMarigold(p);
      else drawPetal(p);
      ctx.restore();
    }

    for (const sp of sparks) {
      if (sp.age >= sp.life) continue;
      sp.age += dt;
      sp.vx -= sp.vx * 2.2 * dt;
      sp.vy -= sp.vy * 2.2 * dt - 60 * dt;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      drawSpark(sp);
    }

    if (t < DURATION) {
      requestAnimationFrame(frame);
    } else {
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
})();

/* ---------- Année du pied de page ---------- */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
