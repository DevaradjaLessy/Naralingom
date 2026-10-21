# Articles d'actualité

Chaque fichier `<slug>.html` de ce dossier devient une page dédiée
`actualites/<slug>.html`, générée par `python3 tools/build.py`.
Le nom du fichier (sans `.html`) est l'adresse de la page : minuscules,
sans accents, mots séparés par des tirets.

## Format d'un fichier

```
---
titre: Thaipoosam Cavadee : porter sa foi pour Mourouga
categorie: Fêtes
tamoul: காவடி
translit: Kāvaḍi
date: 2026-10-21
resume: Une ou deux phrases (220 caractères au plus) affichées sur les cartes et dans les moteurs de recherche.
une: non
image:
---
<p>Premier paragraphe…</p>
<h2>Un intertitre</h2>
<p>…</p>
```

- `categorie` : une seule parmi `Événements`, `Fêtes`, `Rituels`, `Prières`,
  `Histoire`, `Sagesse`, `Traditions`.
- `tamoul` / `translit` : le mot tamoul affiché en grand sur la couverture
  illustrée, et sa transcription.
- `une: oui` place l'article en tête (un seul article à la fois).
- `image` : chemin d'une photo de couverture depuis la racine du site
  (ex. `assets/img/actus/ma-photo.jpg`). Vide : couverture typographique.
- `credit` (facultatif) : légende ou crédit de la photo, affiché sous la couverture.
- `alt` (facultatif) : description de la photo pour les lecteurs d'écran (par défaut, la légende).

## Corps de l'article (HTML)

- `<p>`, `<h2>` (3 à 5 intertitres), `<h3>` au besoin, `<ul>`/`<ol>`,
  `<strong>`, `<em>`.
- Mot tamoul : `<span lang="ta">கோலம்</span>`.
- Encadré « À savoir » :
  `<aside class="encadre"><h3>À savoir</h3><p>…</p></aside>`
- Prière ou citation en trois lignes :
  ```
  <blockquote class="priere">
    <p lang="ta">…texte tamoul (ou sanskrit en écriture tamoule)…</p>
    <p class="translit">…transcription…</p>
    <p class="traduction">…traduction française…</p>
  </blockquote>
  ```
- Lien vers un autre article : `<a href="thai-pongal.html">`.
  Lien vers l'accueil : `<a href="../index.html#trois-v">`.
- Information propre au temple encore inconnue :
  `<span class="a-completer">à préciser</span>`.

## Règles éditoriales

- Ton sérieux et respectueux, phrases courtes et claires, guillemets « ».
- 550 à 850 mots par article.
- Aucun événement, chiffre, date ou citation inventés : ce qui n'est pas
  établi est formulé avec prudence ou marqué « à préciser ».
- Pas d'émojis.
