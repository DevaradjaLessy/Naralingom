#!/usr/bin/env python3
"""Génère les pages d'actualités du site à partir de content/actualites/.

    python3 tools/build.py

Produit :
  - actualites/index.html        liste des articles, filtrable par catégorie
  - actualites/<slug>.html       une page dédiée par article
  - le bloc « Actualités » de index.html (entre ACTUS:DEBUT et ACTUS:FIN)

L'en-tête et le pied de page des pages générées sont repris de index.html :
modifier le menu dans index.html suffit pour mettre tout le site à jour.
"""

import html
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "actualites"
OUT = ROOT / "actualites"
INDEX = ROOT / "index.html"

SITE = "Temple Sinapouralé Naral-UnGom"

CATEGORIES = {
    "Événements": "evenements",
    "Fêtes": "fetes",
    "Rituels": "rituels",
    "Prières": "prieres",
    "Histoire": "histoire",
    "Sagesse": "sagesse",
    "Traditions": "traditions",
}

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]

FONTS = ("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500"
         "&family=Nunito+Sans:wght@400;600;700&family=Noto+Sans+Tamil:wght@500;700"
         "&family=Noto+Serif+Tamil:wght@600&display=swap")


# ---------- Lecture des articles ----------

def parse_article(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        sys.exit(f"{path.name} : en-tête --- … --- introuvable")
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()

    for key in ("titre", "categorie", "tamoul", "date", "resume"):
        if not meta.get(key):
            sys.exit(f"{path.name} : champ « {key} » manquant")
    if meta["categorie"] not in CATEGORIES:
        sys.exit(f"{path.name} : catégorie inconnue « {meta['categorie']} »")

    body = m.group(2).strip()
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    image = meta.get("image", "")
    if image and not (ROOT / image).is_file():
        print(f"  attention : {path.name} : image introuvable ({image}), couverture typographique utilisée")
        image = ""

    return {
        "slug": path.stem,
        "titre": meta["titre"],
        "categorie": meta["categorie"],
        "cat": CATEGORIES[meta["categorie"]],
        "tamoul": meta["tamoul"],
        "translit": meta.get("translit", ""),
        "date": date.fromisoformat(meta["date"]),
        "resume": meta["resume"],
        "une": meta.get("une", "non").lower() in ("oui", "yes", "true"),
        "image": image,
        "credit": meta.get("credit", ""),
        "alt": meta.get("alt") or meta.get("credit", ""),
        "cadrage": meta.get("cadrage", ""),
        "body": body,
        "minutes": max(1, round(words / 200)),
    }


def load_articles():
    articles = [parse_article(p) for p in sorted(CONTENT.glob("*.html"))]
    if not articles:
        sys.exit("Aucun article dans content/actualites/")
    # À la une d'abord, puis du plus récent au plus ancien.
    articles.sort(key=lambda a: (not a["une"], -a["date"].toordinal(), a["titre"]))
    return articles


# ---------- Petits gabarits ----------

def esc(value):
    return html.escape(value, quote=True)


def fr_date(d):
    return f"{d.day} {MOIS[d.month - 1]} {d.year}"


def meta_line(a):
    return (f'<span><time datetime="{a["date"].isoformat()}">{fr_date(a["date"])}</time></span>'
            f'<span>{a["minutes"]} min de lecture</span>')


def cover(a, root, big=False):
    """Photo si elle existe, sinon couverture typographique en tamoul."""
    if a["image"]:
        focus = f' style="object-position: {esc(a["cadrage"])}"' if a["cadrage"] else ""
        return (f'<div class="cover cover--{a["cat"]}">'
                f'<img src="{root}{esc(a["image"])}" alt="{esc(a["alt"])}"{focus} '
                f'loading="{"eager" if big else "lazy"}"></div>')
    translit = f'<span class="cover-tr">{esc(a["translit"])}</span>' if a["translit"] else ""
    return (f'<div class="cover cover--{a["cat"]}" aria-hidden="true">'
            f'<span class="cover-ta" lang="ta">{esc(a["tamoul"])}</span>{translit}</div>')


def chip(a):
    return f'<span class="chip chip--{a["cat"]}">{esc(a["categorie"])}</span>'


def card(a, link_root, img_root):
    return f'''<a class="news-card" href="{link_root}{a["slug"]}.html" data-cat="{a["cat"]}">
  {cover(a, img_root)}
  <div class="news-card-body">
    {chip(a)}
    <h3>{esc(a["titre"])}</h3>
    <p>{esc(a["resume"])}</p>
    <span class="news-meta">{fr_date(a["date"])} · {a["minutes"]} min</span>
  </div>
</a>'''


def feature(a, link_root, img_root, heading="h3"):
    return f'''<a class="feature" href="{link_root}{a["slug"]}.html" data-cat="{a["cat"]}">
  {cover(a, img_root, big=True)}
  <div class="feature-body">
    <span class="feature-label">À la une</span>
    {chip(a)}
    <{heading}>{esc(a["titre"])}</{heading}>
    <p>{esc(a["resume"])}</p>
    <span class="news-meta">{fr_date(a["date"])} · {a["minutes"]} min de lecture</span>
    <span class="read">Lire l'article →</span>
  </div>
</a>'''


# ---------- En-tête et pied de page repris de l'accueil ----------

def shared_chrome():
    source = INDEX.read_text(encoding="utf-8")
    header = re.search(r'<header class="site-header".*?</header>', source, re.S).group(0)
    footer = re.search(r'<footer class="site-footer">.*?</footer>', source, re.S).group(0)

    def relink(fragment):
        fragment = fragment.replace('href="#haut"', 'href="../index.html"')
        fragment = re.sub(r'href="#([\w-]+)"', r'href="../index.html#\1"', fragment)
        fragment = fragment.replace('href="actualites/', 'href="')
        fragment = fragment.replace('src="assets/', 'src="../assets/')
        return fragment

    header = relink(header).replace(
        'data-nav="actualites"', 'data-nav="actualites" class="is-active" aria-current="page"')
    return header, relink(footer)


def page(title, description, body, header, footer, extra_head=""):
    return f'''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <meta name="theme-color" content="#6b1421">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{FONTS}" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">{extra_head}
</head>
<body>
  <a class="skip-link" href="#contenu">Aller au contenu</a>

  {header}

  <main id="contenu">
{body}
  </main>

  {footer}

  <script src="../assets/js/main.js" defer></script>
</body>
</html>
'''


# ---------- Pages ----------

def build_list(articles, header, footer):
    une = next((a for a in articles if a["une"]), None)
    others = [a for a in articles if a is not une]

    counts = {}
    for a in articles:
        counts[a["categorie"]] = counts.get(a["categorie"], 0) + 1
    buttons = [f'<button class="filter" type="button" data-filter="toutes" aria-pressed="true">'
               f'Toutes <span class="filter-count">{len(articles)}</span></button>']
    for name, slug in CATEGORIES.items():
        if name in counts:
            buttons.append(f'<button class="filter" type="button" data-filter="{slug}" aria-pressed="false">'
                           f'{esc(name)} <span class="filter-count">{counts[name]}</span></button>')

    body = f'''    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <nav class="breadcrumb" aria-label="Fil d'Ariane">
          <ol><li><a href="../index.html">Accueil</a></li><li aria-current="page">Actualités</li></ol>
        </nav>
        <p class="eyebrow"><span lang="ta">செய்திகள்</span> · Seythigal</p>
        <h1 id="page-title">Actualités</h1>
        <p>La vie du temple, les grandes fêtes, les prières et les repères pour comprendre la tradition tamoule à La Réunion.</p>
      </div>
    </section>

    <section class="news-list" aria-label="Articles">
      <div class="container">
        <div class="filters" role="group" aria-label="Filtrer par catégorie">
          {"".join(buttons)}
        </div>
        {feature(une, "", "../", heading="h2") if une else ""}
        <div class="news-grid" id="news-grid">
          {"".join(card(a, "", "../") for a in others)}
        </div>
      </div>
    </section>'''

    (OUT / "index.html").write_text(
        page(f"Actualités · {SITE}",
             "Actualités, fêtes, prières et histoire du temple tamoul Sinapouralé Naral-UnGom à La Réunion.",
             body, header, footer),
        encoding="utf-8")


def related_for(a, articles, n=3):
    same = [x for x in articles if x is not a and x["cat"] == a["cat"]]
    rest = [x for x in articles if x is not a and x["cat"] != a["cat"]]
    return (same + rest)[:n]


def build_article(a, articles, header, footer):
    credit = f'<figcaption>{esc(a["credit"])}</figcaption>' if a["image"] and a["credit"] else ""
    ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": a["titre"],
        "description": a["resume"],
        "datePublished": a["date"].isoformat(),
        "inLanguage": "fr",
        "articleSection": a["categorie"],
        "publisher": {"@type": "Organization", "name": SITE},
    }
    extra_head = ('\n  <meta property="og:type" content="article">'
                  f'\n  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>')

    body = f'''    <article>
      <header class="article-head">
        <div class="container">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <ol>
              <li><a href="../index.html">Accueil</a></li>
              <li><a href="index.html">Actualités</a></li>
              <li aria-current="page">{esc(a["categorie"])}</li>
            </ol>
          </nav>
          {chip(a)}
          <h1>{esc(a["titre"])}</h1>
          <p class="news-meta">{meta_line(a)}</p>
        </div>
      </header>

      <div class="container">
        <figure class="article-cover">
          {cover(a, "../", big=True)}
          {credit}
        </figure>

        <div class="prose">
          <p class="chapo">{esc(a["resume"])}</p>
{a["body"]}
        </div>

        <div class="article-foot">
          <a class="link-more" href="index.html">← Toutes les actualités</a>
          <button class="copy-link" type="button" data-copy-link>Copier le lien de l'article</button>
        </div>
      </div>
    </article>

    <section class="related" aria-labelledby="related-title">
      <div class="container">
        <h2 id="related-title">À lire aussi</h2>
        <div class="news-grid">
          {"".join(card(x, "", "../") for x in related_for(a, articles))}
        </div>
      </div>
    </section>'''

    (OUT / f'{a["slug"]}.html').write_text(
        page(f'{a["titre"]} · {SITE}', a["resume"], body, header, footer, extra_head),
        encoding="utf-8")


def build_home_block(articles):
    une = next((a for a in articles if a["une"]), None)
    latest = [a for a in articles if a is not une][:3]
    block = f'''        <div class="news-head">
          <div>
            <p class="eyebrow"><span lang="ta">செய்திகள்</span> · Actualités</p>
            <h2 id="actualites-title">La vie du temple</h2>
          </div>
          <a class="link-more" href="actualites/index.html">Toutes les actualités →</a>
        </div>
        {feature(une, "actualites/", "") if une else ""}
        <div class="news-grid">
          {"".join(card(a, "actualites/", "") for a in latest)}
        </div>'''

    source = INDEX.read_text(encoding="utf-8")
    new, n = re.subn(r"(<!-- ACTUS:DEBUT -->\n).*?(<!-- ACTUS:FIN -->)",
                     lambda m: m.group(1) + block + "\n" + m.group(2), source, flags=re.S)
    if n != 1:
        sys.exit("index.html : repères ACTUS:DEBUT / ACTUS:FIN introuvables")
    INDEX.write_text(new, encoding="utf-8")


def main():
    articles = load_articles()
    if sum(a["une"] for a in articles) > 1:
        sys.exit("Un seul article peut être « une: oui »")

    OUT.mkdir(exist_ok=True)
    keep = {f'{a["slug"]}.html' for a in articles} | {"index.html"}
    for old in OUT.glob("*.html"):
        if old.name not in keep:
            old.unlink()

    header, footer = shared_chrome()
    build_list(articles, header, footer)
    for a in articles:
        build_article(a, articles, header, footer)
    build_home_block(articles)
    print(f"{len(articles)} articles générés dans actualites/")


if __name__ == "__main__":
    main()
