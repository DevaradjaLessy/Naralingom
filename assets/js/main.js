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

/* ---------- Pluie de fleurs à l'ouverture : பூ மழை (poo mazhai) ----------
   Comme on lance des fleurs pour accueillir une divinité ou un invité :
   pétales de souci (la fleur des guirlandes), jasmin et pétales de rose
   tombent quelques secondes puis s'effacent, sans bloquer la page. */
(function flowerShower() {
  if (!TEMPLE.fleurs) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;
  canvas.className = "flower-shower";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);

  const DURATION = 4500; // ms, fondu compris
  const FADE_IN = 300;
  const FADE_OUT = 1200;
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
  const KINDS = ["souci", "souci", "souci", "souci", "souci", "jasmin", "jasmin", "jasmin", "rose", "rose", "guirlande"];
  const COLORS = {
    souci: ["#f59e0b", "#e8871e", "#f6c453", "#f2a516"],
    rose: ["#b3202a", "#c8324a", "#9c1b2b"],
  };

  const count = Math.round(Math.min(110, Math.max(40, W / 11)));
  const petals = Array.from({ length: count }, () => {
    const kind = pick(KINDS);
    return {
      kind,
      color: COLORS[kind] ? pick(COLORS[kind]) : null,
      size: { jasmin: rand(7, 10), guirlande: rand(9, 13) }[kind] || rand(8, 13),
      x: rand(0, W),
      y: rand(-0.6, 0.15) * H,
      vy: rand(0.16, 0.3) * H, // px par seconde
      vx: rand(-20, 20),
      sway: rand(12, 40),
      freq: rand(1.2, 2.6),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-2.2, 2.2),
      flip: rand(0, Math.PI * 2),
      vflip: rand(2, 5),
    };
  });

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

  const start = performance.now();
  let last = start;

  function frame(now) {
    const t = now - start;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = Math.min(1, t / FADE_IN, (DURATION - t) / FADE_OUT);

    for (const p of petals) {
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(t / 1000 * p.freq + p.phase) * p.sway) * dt;
      p.rot += p.vr * dt;
      p.flip += p.vflip * dt;
      if (p.y > H + 20) continue;

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
