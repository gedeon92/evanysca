# admin — back-office de la boutique

Vite + React 18 + TypeScript. Outil interne : il n'a pas de domaine acheté, reste en `noindex` et
n'est accessible qu'avec un compte administrateur.

## Installation

```bash
npm install
cp .env.example .env   # VITE_API_URL
npm run dev            # http://localhost:8081
```

L'API doit tourner en parallèle (`cd ../backend && npm run start:dev`), et son `CORS_ORIGIN` doit
contenir `http://localhost:8081`.

## Variables d'environnement

| Variable | Détail |
| --- | --- |
| `VITE_API_URL` | URL de l'API, **sans slash final**. En production : l'adresse du service Render. |

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de développement sur le port 8081 |
| `npm run build` | vérification TypeScript puis build de production |
| `npm run typecheck` | vérification TypeScript seule |
| `npm run preview` | sert le build local |

## Pages

| Route | Rôle |
| --- | --- |
| `/connexion` | seule page publique |
| `/` | tableau de bord : compteurs, ruptures, cinq derniers ajouts |
| `/produits` | liste paginée, recherche (nom, ligne, référence, SKU), filtres catégorie et statut |
| `/produits/nouveau` `/produits/:id` | formulaire complet, teintes et galeries |
| `/categories` | création, renommage, suppression |
| `/profil` | identité et mot de passe |

## Ce qu'il faut savoir pour intervenir dessus

- **Le jeton d'accès ne vit qu'en mémoire JavaScript** (`src/lib/api.ts`), jamais dans
  `localStorage`. Un rechargement le perd : c'est le cookie `httpOnly` de rafraîchissement qui le
  regagne silencieusement, via `AdminAuthContext`. D'où le `chargementInitial` de `ProtectedRoute`,
  sans lequel la page de connexion clignoterait à chaque F5.
- **Un seul rafraîchissement à la fois** : si trois requêtes prennent un 401 ensemble, elles
  attendent le même appel. Trois appels concurrents échoueraient, le jeton ayant tourné entre-temps.
- **`apiFetch` ne force pas `Content-Type` sur un `FormData`** : le navigateur doit poser lui-même
  la frontière multipart, sinon l'envoi d'image échoue.
- **Les photos partent d'abord chez Cloudinary**, puis leur URL est rattachée à la teinte. L'envoi
  est séquentiel : en parallèle, l'ordre choisi serait perdu.
- **Le formulaire de création ne gère pas les teintes** : elles ont besoin de l'identifiant du
  produit, qui n'existe qu'après l'enregistrement. La page bascule donc sur la fiche dès la création.
- **À la suppression d'un produit, la clé de cache `["produit", id]` n'est pas touchée.**
  L'invalider — ou la retirer — relancerait une requête sur une fiche qui vient de disparaître,
  puisque son `useQuery` est encore monté le temps de la navigation.

## Design system

`src/index.css` et `tailwind.config.ts` sont **identiques à ceux du site client**. Les couleurs ne
sont jamais écrites en dur : elles pointent vers des tokens HSL déclarés dans `:root`. Toute
modification de palette doit être reportée dans les deux projets.
