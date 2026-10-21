# Temple Sinapouralé Naral-UnGom — site web

Site du temple tamoul **Sinapouralé Naral-UnGom** à La Réunion, fondé par
**M. Mogan Ungom**, engagé indien, comme lieu de rassemblement et de culte.

Site statique (HTML, CSS, JavaScript) : il suffit d'ouvrir `index.html` dans un
navigateur. Seules les pages d'actualités sont générées, par un petit script
Python sans dépendance (voir « Actualités »).

## Structure

```
index.html              Page d'accueil, toutes les sections
actualites/             Pages générées : liste des actualités + une page par article
content/actualites/     Textes des articles (à modifier ici, pas dans actualites/)
tools/build.py          Générateur des pages d'actualités
assets/css/style.css    Mise en forme (palette bordeaux, safran, curcuma)
assets/js/main.js       Menu mobile, agenda, examen des 3V, adhésion, filtres
assets/img/             Icône du site, photos (assets/img/actus/ pour les articles)
```

Sections de l'accueil : Actualités (article à la une + derniers articles) ·
Le temple · Fondateur & repères historiques · Divinités · Calendrier des fêtes ·
Visite (horaires, bons gestes) · La voie des 3V · Espace adhérents & partenaire
Kreolocation.re · Galerie · Contact.

## Actualités

Chaque article est un fichier de `content/actualites/` (format décrit dans
`content/actualites/README.md`). Après tout ajout ou modification :

```
python3 tools/build.py
```

Le script régénère `actualites/index.html`, les pages d'articles et le bloc
« Actualités » de l'accueil. L'article marqué `une: oui` est placé en tête.

Photo de couverture d'un article : la déposer dans `assets/img/actus/`, puis
renseigner `image: assets/img/actus/nom-de-la-photo.jpg` dans l'en-tête de
l'article. Sans photo, une couverture typographique en tamoul est affichée.

## Compléter le contenu

Les informations encore manquantes sont repérées dans `index.html` par la
classe `a-completer` (soulignées en pointillés orange sur le site). Une fois le
texte définitif saisi, retirer la classe.

Dans `assets/js/main.js`, l'objet `TEMPLE` en haut du fichier permet de régler :

- `email` : l'adresse qui reçoit les demandes d'adhésion ;
- `agenda` : les prochaines dates au temple, affichées automatiquement au-dessus
  du calendrier des fêtes (les dates passées disparaissent d'elles-mêmes).

Pour ajouter une photo dans la galerie, la déposer dans `assets/img/` et
remplacer `<div class="ph-img"></div>` par
`<img src="assets/img/ma-photo.jpg" alt="Description de la photo">`.

### Informations à fournir

- [ ] Date et lieu d'arrivée de M. Mogan Ungom, sa région d'origine en Inde
- [ ] Année de fondation du temple, commune et adresse
- [ ] Portrait du fondateur (si la famille en conserve un)
- [ ] Divinités réellement honorées au temple
- [ ] Horaires des pujas
- [ ] Téléphone et e-mail de contact
- [ ] Conditions proposées aux adhérents par Kreolocation.re
- [ ] Auteur et texte de référence de la voie des 3V (Vilain, Voleur, Vantard)
- [ ] Photos : gopuram, sanctuaire, fêtes, familles
- [ ] Photo et détails de la marche sur le feu à Londres (date, organisateurs, divinité honorée)

## Mise en ligne

Le site est publié avec **GitHub Pages** depuis la branche `master` (dossier racine) :
https://devaradjalessy.github.io/Naralingom/

Chaque envoi (push) sur `master` met le site à jour en une minute environ.
Le fichier `.nojekyll` demande à GitHub de servir les fichiers tels quels.
