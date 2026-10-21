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

/* ---------- Année du pied de page ---------- */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
