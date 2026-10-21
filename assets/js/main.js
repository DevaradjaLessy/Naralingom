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

  /* Apparition douce des blocs au défilement */
  const revealables = document.querySelectorAll(
    ".fact, .pillar, .deity, .festival, .v-card, .timeline li, .ph"
  );
  const reveal = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  revealables.forEach((el) => {
    el.classList.add("reveal");
    reveal.observe(el);
  });
}

/* ---------- Agenda du temple ---------- */
(function renderAgenda() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = TEMPLE.agenda
    .map((ev) => ({ ...ev, when: new Date(`${ev.date}T00:00:00`) }))
    .filter((ev) => !Number.isNaN(ev.when.getTime()) && ev.when >= today)
    .sort((a, b) => a.when - b.when);

  if (!upcoming.length) return;

  const fmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const list = document.getElementById("agenda-list");

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
      setStatus("Les demandes en ligne ouvriront bientôt. En attendant, adressez-vous au temple.", "error");
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

/* ---------- Année du pied de page ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
