# Temple Sinapouralé Naral-UnGom — site web

Site du temple tamoul **Sinapouralé Naral-UnGom** à La Réunion, fondé par
**M. Mogan Ungom**, engagé indien, comme lieu de rassemblement et de culte.

Site statique (HTML, CSS, JavaScript), sans outil de build : il suffit d'ouvrir
`index.html` dans un navigateur.

## Structure

```
index.html            Page unique, toutes les sections
assets/css/style.css  Mise en forme (palette bordeaux, safran, curcuma)
assets/js/main.js     Menu mobile, agenda, examen des 3V, formulaire d'adhésion
assets/img/           Icône du site (lampe) et futures photos
```

Sections : Accueil · Le temple · Fondateur & repères historiques · Divinités ·
Calendrier des fêtes · Visite (horaires, bons gestes) · La voie des 3V ·
Espace adhérents & partenaire Kreolocation.re · Galerie · Contact.

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

## Mise en ligne

Le site peut être publié gratuitement avec **GitHub Pages** :
Settings → Pages → Source « Deploy from a branch » → branche principale, dossier `/ (root)`.
