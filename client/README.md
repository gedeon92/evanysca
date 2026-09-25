# client — site de la boutique

Vite + React 18 + TypeScript. Vitrine et boutique. **Aucun compte client, aucun paiement en ligne,
aucune commande en base** : le panier vit dans le navigateur et la commande part sur WhatsApp.

## Installation

```bash
npm install
cp .env.example .env   # renseigner au minimum VITE_WHATSAPP_NUMBER
npm run dev            # http://localhost:8080
npm test               # 21 tests sur la construction du message et les règles de stock
```

L'API doit tourner en parallèle, et son `CORS_ORIGIN` doit contenir `http://localhost:8080`.

## Variables d'environnement

**Rien de ce qui appartient à la marque n'est écrit en dur dans le code.** Tout passe par ces
variables, relues dans [`src/lib/boutique.ts`](src/lib/boutique.ts) — un seul fichier à connaître
le jour où les informations définitives arrivent.

| Variable | Obligatoire | Détail |
| --- | --- | --- |
| `VITE_API_URL` | oui | URL de l'API, sans slash final |
| `VITE_WHATSAPP_NUMBER` | oui | Format international **sans `+` ni espaces** : `221770000000` |
| `VITE_BRAND_NAME` | non | Nom affiché partout, y compris dans l'onglet |
| `VITE_BRAND_TAGLINE` | non | Phrase d'accroche de l'accueil et du pied de page |
| `VITE_BRAND_CITY` | non | Ville mentionnée sur l'accueil et la page contact |
| `VITE_BRAND_EMAIL` | non | Affiché seulement s'il est renseigné |
| `VITE_BRAND_INSTAGRAM` | non | Affiché seulement s'il est renseigné |

Un numéro mal formaté n'échoue pas bruyamment : WhatsApp ouvre une conversation vide. Le site
contrôle donc le format et **désactive les boutons de commande** avec un message explicite plutôt
que de laisser partir une commande dans le vide.

## Pages

`/` accueil éditorial · `/collection` grille filtrable · `/produit/:slug` fiche ·
`/panier` · `/contact` · `/faq` · 404.

Pas de `/connexion`, pas de `/compte`, pas de `/commande` : ils n'existent pas dans ce projet.

## Ce qu'il faut savoir pour intervenir dessus

- **Le bouton de commande est toujours un vrai `<a href>`**, dont l'URL est calculée en amont dans
  un `useMemo`. Un `onClick` qui construirait le lien après un `await` perdrait le lien avec le
  geste de l'utilisatrice, et Safari sur iPhone bloquerait l'ouverture de l'onglet. C'est la règle
  la plus importante du projet côté front.
- **Le message a deux formats.** Lisible par défaut ; au-delà de 1 800 caractères d'URL encodée, il
  bascule automatiquement en format compact. `wa.me?text=` tronque sans prévenir, et chaque accent
  triple de taille une fois encodé. La bascule est testée dans
  [`src/lib/whatsapp.test.ts`](src/lib/whatsapp.test.ts).
- **Le panier est revalidé** à l'arrivée sur `/panier`, via `POST /api/cart/validate` : prix,
  stock et existence de chaque teinte sont recoupés avec le serveur. Sans ça, un panier oublié
  pendant trois semaines enverrait une commande à un prix que la vendeuse ne pourrait pas honorer.
  Les corrections sont annoncées par des toasts. Si l'API est injoignable, **le panier n'est pas
  touché** : le vider sur une coupure réseau serait bien pire.
- **Le panier n'est jamais vidé automatiquement** après l'envoi sur WhatsApp : rien n'est confirmé
  tant que la conversation n'a pas eu lieu. Un bouton « Vider le panier » apparaît alors.
- **Le stock n'est jamais affiché en chiffres.** Sans modèle de commande, rien ne le décrémente :
  annoncer « 2 en stock » serait une promesse intenable. Au-dessus de 3, rien ; de 1 à 3,
  « Dernière pièce » ou « Dernières pièces » ; à 0, « Épuisé » et boutons désactivés.
- **Les filtres de la collection vivent dans l'URL** (`?categorie=`, `?page=`) : une grille filtrée
  se partage par lien et survit au bouton Précédent.
- **Le contenu du `localStorage` n'est jamais pris pour argent comptant** : chaque ligne relue est
  revalidée champ par champ, et un stockage inaccessible (navigation privée) donne un panier vide
  plutôt qu'une page blanche.

## Design system

`src/index.css` et `tailwind.config.ts` sont **identiques à ceux de l'admin**. Les couleurs pointent
toutes vers des tokens HSL déclarés dans `:root`. Toute modification doit être reportée des deux
côtés.
