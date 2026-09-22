# Prompt — Boutique en ligne avec commande par WhatsApp

Construis une boutique en ligne complète en reprenant **exactement la même architecture, les mêmes
conventions de code et le même style visuel** que le projet « Mimi Cherry Private » décrit ci-dessous.
La seule vraie différence fonctionnelle : **il n'y a aucun paiement en ligne et aucun compte client** —
le client remplit son panier puis est redirigé vers le **WhatsApp de la vendeuse** avec sa commande
déjà rédigée dans le message.

---

## 1. Structure du dépôt (3 dossiers à la racine)

```
backend/                 API NestJS 10 + Prisma 5 + PostgreSQL
client/                  Site vitrine + boutique (Vite + React 18 + TypeScript)
admin/                   Back-office (Vite + React 18 + TypeScript)
```

### backend/ — NestJS 10 (TypeScript, CommonJS)

Dépendances : `@nestjs/common`, `@nestjs/core`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`,
`@nestjs/platform-express`, `@nestjs/throttler`, `@prisma/client`, `prisma`, `bcrypt`, `cloudinary`,
`cookie-parser`, `helmet`, `passport-jwt`, `zod`, `vitest`.

Arborescence imposée :

```
src/main.ts                                bootstrap
src/app.module.ts                          import de tous les modules
src/config/env.validation.ts               schéma Zod des variables d'environnement
src/prisma/prisma.module.ts | prisma.service.ts
src/common/decorators/current-user.decorator.ts | roles.decorator.ts
src/common/filters/http-exception.filter.ts
src/common/pipes/zod-validation.pipe.ts
src/common/security/tokens.ts
src/modules/<nom>/<nom>.controller.ts | .service.ts | .module.ts | dto/*.ts
src/modules/admin/<sous-domaine>/...       tout ce qui est protégé par le rôle ADMIN
prisma/schema.prisma | seed.ts | create-admin.ts | reset-admin-password.ts
```

`main.ts` reproduit à l'identique :

- `app.getHttpAdapter().getInstance().set("trust proxy", 1)` (API derrière le proxy Render, sinon le
  rate limiting s'applique globalement au lieu d'être par client) ;
- `helmet()`, `cookieParser()` ;
- `enableCors({ origin: CORS_ORIGIN.split(","), credentials: true })` ;
- `setGlobalPrefix("api")` ;
- `useGlobalFilters(new HttpExceptionFilter())`.

`app.module.ts` : `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`,
`ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])` et `APP_GUARD` = `ThrottlerGuard`.

Ce garde global est bien trop permissif pour la seule porte d'entrée du projet : la route de
connexion porte en plus `@Throttle({ default: { limit: 5, ttl: 60_000 } })`.

Validation : **jamais de class-validator**. Un schéma Zod par DTO dans `dto/*.ts`, appliqué via
`@UsePipes(new ZodValidationPipe(schema))`. Le pipe renvoie `{ message, errors: { fieldErrors, formErrors } }`.

`HttpExceptionFilter` traduit aussi les erreurs Prisma dans ce même format : `P2002` (contrainte
d'unicité violée) devient un 409 portant le champ fautif dans `errors.fieldErrors`, `P2025`
(enregistrement introuvable) devient un 404. `ref` et `sku` étant saisis à la main, la collision est
fréquente : elle ne doit jamais sortir en 500 opaque.

### client/ et admin/ — Vite + React 18 + TypeScript

Dépendances communes : `react-router-dom` v6, `@tanstack/react-query` v5, `tailwindcss` +
`tailwindcss-animate`, `clsx` + `tailwind-merge` (helper `cn()` dans `src/lib/utils.ts`),
`lucide-react` (icônes), `sonner` (toasts).
Le client ajoute : `framer-motion`, `embla-carousel-react` + `embla-carousel-autoplay`,
`@radix-ui/react-accordion`, `@radix-ui/react-tooltip`.

Conventions front à respecter :

- `src/lib/api.ts` : un wrapper `apiFetch<T>(path, init)` + une classe `ApiError` portant `status` et
  `fieldErrors`, qui reconstruit un message lisible champ par champ à partir de la réponse Zod du
  backend, et `credentials: "include"` sur chaque requête.
- `src/api/<ressource>.ts` : une fonction typée par endpoint (pas d'appel `fetch` dans les composants).
- `src/App.tsx` : `QueryClientProvider` + providers de contexte + `BrowserRouter`, page d'accueil en
  import statique, **toutes les autres routes en `lazy()` + `<Suspense>`** avec un fallback squelette.
  `QueryClient` configuré avec `staleTime: 60_000` et `refetchOnWindowFocus: false`.
- Routes et libellés **en français** : `/collection`, `/produit/:slug`, `/panier`, `/contact`, etc.
- `vercel.json` dans chaque front : `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
- Tous les commentaires de code sont en français et expliquent le *pourquoi*, pas le *quoi*.

---

## 2. Design system (identique dans les deux fronts)

Les tokens de couleur sont déclarés en HSL dans `src/index.css` sous `@layer base { :root { ... } }`
et consommés par `tailwind.config.ts` via `hsl(var(--token))`. **Le fichier `index.css` de l'admin
reprend les mêmes tokens que celui du client** pour garantir une identité visuelle commune.

Tokens à prévoir : `--background --foreground --card --popover --primary --secondary --muted --accent
--destructive --border --input --ring --radius` (1.5rem) + une palette de marque (neutres chauds +
deux ou trois couleurs d'accent) + `--gradient-*` et `--shadow-soft` / `--shadow-card`.

Typographie : une serif pour les titres (`h1..h4`, classe `.font-serif`) et une sans-serif légère
(`font-weight: 300`) pour le corps, chargées depuis Google Fonts.

Classes utilitaires maison dans `@layer components` : `.eyebrow` (petit texte majuscule,
`tracking-[0.35em]`), `.eyebrow-accent`, `.link-underline` (soulignement animé au survol),
`.rule-fade` (filet dégradé). Animations `fade-in` / `fade-up` en `cubic-bezier(0.22,1,0.36,1)`,
composants `Reveal` (apparition au scroll) et `Skeleton` (chargement).

Esthétique générale : luxe éditorial, beaucoup de blanc, grandes images, petites majuscules très
espacées, coins arrondis généreux, ombres douces et diffuses. Prix affichés en **FCFA** formatés avec
des espaces. Contrat unique, valable partout : `formatFcfa(165000)` renvoie `"165 000 FCFA"`,
**suffixe compris** — n'ajoute jamais « FCFA » après un appel à cette fonction.

---

## 3. Base de données (Prisma / PostgreSQL)

Reprends le schéma existant **en le simplifiant** : il n'y a ni compte client, ni panier serveur, ni
adresses, ni favoris, ni commandes, ni paiements, ni newsletter.

```prisma
enum Role { ADMIN }

model User {                  // uniquement les administrateurs
  id, email @unique, passwordHash, firstName, lastName, phone?, role @default(ADMIN),
  createdAt, updatedAt
  refreshTokens RefreshToken[]
  @@map("users")
}

model RefreshToken {          // un jeton par appareil connecté → déconnexion ciblée possible
  id, userId, tokenHash @unique, expiresAt, revokedAt?, createdAt
  @@index([userId]) @@map("refresh_tokens")
}

model Category {
  id, name, slug @unique, createdAt
  products Product[]
  @@map("categories")
}

model Product {
  id, categoryId, line, name, slug @unique, ref @unique,
  displayOrder @default(0),      // curation manuelle de l'ordre en grille
  price Int,                     // en FCFA, entier — jamais de flottant
  detail, shortDescription, story, designIntent, materials, craftsmanship, care,
  tag?, isActive @default(true), createdAt, updatedAt
  variants ProductVariant[]
  @@index([categoryId]) @@map("products")
}

model ProductVariant {         // une teinte/déclinaison : c'est elle qui porte le stock
  id, productId, colorName, swatchHex, sku @unique, stock @default(0), createdAt, updatedAt
  images ProductImage[]
  @@unique([productId, colorName]) @@index([productId]) @@map("product_variants")
}

model ProductImage {
  id, variantId, url, publicId?, position @default(0), createdAt
  @@index([variantId]) @@map("product_images")
}
```

Tous les identifiants sont des `uuid()`, tous les noms de tables sont mappés en snake_case pluriel.

Ordre d'affichage des produits, partout où une liste est rendue (client comme admin) :
`orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]` — sans quoi `displayOrder` ne sert à rien.

---

## 4. Le parcours client — commande par WhatsApp

### Pages du site client

`/` (accueil éditorial : hero carrousel, collection, savoir-faire, histoire de la marque, appel à
l'action), `/collection` (grille filtrable par catégorie), `/produit/:slug` (galerie, sélecteur de
teinte, stock, accordéon description / matières / entretien), `/panier`, `/contact`, les pages
éditoriales (`/notre-histoire`, `/livraison`, `/faq`, …) et une page 404.

**Pas de page `/connexion`, `/creer-compte`, `/compte`, `/commande`, ni de favoris côté serveur.**

### Panier

100 % côté navigateur, dans `localStorage`, via un `CartContext` (`items`, `count`, `subtotal`,
`addItem`, `removeItem`, `setQty`, `clear`). Chaque ligne stocke : identifiant de variante, nom du
produit, teinte, prix, image, quantité.

**Le panier doit être revalidé.** Il survit des semaines dans le navigateur alors que le prix, le
stock et l'existence même d'une variante changent côté admin : sans contrôle, la cliente enverrait
sur WhatsApp une commande à un prix obsolète pour un produit supprimé. Au montage de `/panier`, et
juste avant de construire le message, appelle `POST /api/cart/validate` avec la liste des
identifiants de variante ; la réponse donne pour chacune `{ exists, isActive, price, stock, name,
color }`. Le contexte applique alors les prix renvoyés, retire les lignes disparues ou désactivées,
plafonne les quantités au stock disponible, et signale chaque correction par un toast. C'est le
**seul** appel API du panier.

### Bouton « Commander sur WhatsApp »

Sur la page panier, remplace tout le tunnel de paiement par un formulaire très court et facultatif
(nom, ville/quartier, téléphone, note) puis un bouton unique qui ouvre WhatsApp :

```ts
const numero = import.meta.env.VITE_WHATSAPP_NUMBER; // ex. "221770000000", sans + ni espaces

// Deux formats : lisible tant que le message tient dans l'URL, compact au-delà. `wa.me?text=`
// tronque silencieusement les messages trop longs, et encodeURIComponent triple la taille de
// chaque accent et de chaque retour à la ligne — un panier de dix lignes y arrive vite.
const ligneLisible = (it: CartItem, i: number) =>
  `${i + 1}. ${it.name} — ${it.color}\n   Quantité : ${it.qty} — ${formatFcfa(it.price * it.qty)}`;
const ligneCompacte = (it: CartItem) =>
  `${it.qty}× ${it.name} / ${it.color} — ${formatFcfa(it.price * it.qty)}`;

const corps = (ligne: (it: CartItem, i: number) => string) =>
  `Bonjour, je souhaite passer commande :\n\n${items.map(ligne).join("\n")}\n\n` +
  `Total : ${formatFcfa(subtotal)}\n\n` +
  `Nom : ${nom}\nVille / quartier : ${ville}\nTéléphone : ${telephone}` +
  (note ? `\nNote : ${note}` : "");

const lien = (message: string) => `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;

// 1 800 caractères d'URL encodée : marge confortable sous la limite pratique des navigateurs.
const LIMITE_URL = 1800;
const lisible = lien(corps(ligneLisible));
const href = lisible.length <= LIMITE_URL ? lisible : lien(corps(ligneCompacte));
```

Règles :

- **le bouton est un vrai `<a href={href} target="_blank" rel="noopener noreferrer">`**, dont l'URL
  est calculée en amont dans un `useMemo` — jamais un `onClick` qui ouvrirait l'onglet après un
  `await` : le lien avec le geste utilisateur serait perdu et Safari iOS bloquerait la popup ;
- le lien `https://wa.me/...` fonctionne sur mobile (ouvre l'application) comme sur ordinateur
  (WhatsApp Web) ;
- le panier n'est **pas** vidé automatiquement — affiche un toast « Commande envoyée sur WhatsApp »
  avec un bouton « Vider le panier » ;
- un bouton WhatsApp flottant est présent sur tout le site, ainsi que sur la fiche produit
  (« Commander cet article ») avec un message pré-rempli pour ce seul article ;
- la page `/contact` n'envoie aucun e-mail : elle affiche le numéro WhatsApp, un lien `wa.me` et les
  réseaux sociaux.

---

## 5. Le back-office admin

Mêmes fondations que l'admin existant : `AdminAuthContext`, `ProtectedRoute`, `AdminLayout` avec
barre latérale (tiroir coulissant sur mobile, fermeture automatique au changement de route),
composants UI maison `Button`, `Badge`, `Field`, `Modal`, `Pagination`, toasts `sonner`.

Navigation réduite à :

```
Tableau de bord   /            nombre de produits, de catégories, produits en rupture, derniers ajouts
Produits          /produits    liste paginée + recherche + filtre catégorie/statut
                  /produits/nouveau et /produits/:id   formulaire complet
Catégories        /categories  création, renommage, suppression (refusée si des produits l'utilisent)
Profil            /profil      changer son e-mail et son mot de passe
```

**Pas de page Clients, pas de page Commandes, pas de page Newsletter.**

### Formulaire produit (le cœur de l'admin)

Un seul écran gère : les champs texte du produit, la catégorie, le prix, l'ordre d'affichage, le
statut actif/inactif, puis la liste des **variantes** (nom de teinte, pastille couleur `#RRGGBB`, SKU,
stock) et, pour chaque variante, la **galerie d'images** : glisser-déposer ou sélection de fichier,
envoi immédiat vers Cloudinary, aperçu, réordonnancement par `position`, suppression.

### Envoi d'images

Endpoint `POST /api/admin/uploads` protégé par `JwtAuthGuard + RolesGuard + @Roles("ADMIN")`,
`FileInterceptor("file")`, limite 5 Mo, types autorisés `image/jpeg, image/png, image/webp`,
`publicId` préfixé et généré par `randomUUID()`, réponse `{ url, publicId }`.
`DELETE /api/admin/uploads/:publicId(*)` refuse tout identifiant ne portant pas le préfixe attendu.
Le paramètre est **wildcard** : le `publicId` Cloudinary porte le préfixe imposé, donc un `/`, qu'un
`:publicId` simple couperait — la route ne serait jamais atteinte.
Côté front, `apiFetch` ne force pas `Content-Type` quand le corps est un `FormData`.

---

## 6. Authentification (administrateurs uniquement)

- Connexion : `POST /api/auth/admin-login` → `accessToken` JWT court (15 min) renvoyé dans le corps,
  **gardé uniquement en mémoire JavaScript**, jamais dans `localStorage`.
- Rafraîchissement : cookie `httpOnly`, route `POST /api/auth/admin-refresh`. Ses attributs dépendent
  de l'environnement — `secure: isProd`, `sameSite: isProd ? "none" : "lax"` : `none` est
  indispensable en production (Vercel et Render sont deux sites distincts) mais casse le
  développement en `http://localhost`.
  `apiFetch` retente **une seule fois** la requête après un 401, sauf sur les routes `/auth/*`.
  Le jeton de rafraîchissement est stocké **haché** en base, avec révocation par appareil.
- Mots de passe : `bcrypt`. Rôle vérifié par `RolesGuard` + décorateur `@Roles("ADMIN")`.
- **Aucun envoi d'e-mail dans tout le projet** (ni Brevo, ni autre) : pas de « mot de passe oublié »
  par e-mail. À la place, deux scripts Prisma exécutés par le développeur :
  `npm run admin:create` (`prisma/create-admin.ts`) et `npm run admin:reset-password`
  (`prisma/reset-admin-password.ts`), qui reçoivent l'e-mail et le mot de passe en arguments.

---

## 7. Endpoints de l'API

```
GET    /api/health
GET    /api/categories
GET    /api/products                ?search= &category= &page= &limit=   (uniquement isActive)
GET    /api/products/:slug
POST   /api/cart/validate           revalidation du panier local (prix, stock, existence)

POST   /api/auth/admin-login
POST   /api/auth/admin-refresh
POST   /api/auth/admin-logout
GET    /api/auth/me

GET    /api/admin/dashboard
GET    /api/admin/products          ?search= &category= &status= &page= &limit=
POST   /api/admin/products
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id
POST   /api/admin/products/:id/variants
PATCH  /api/admin/variants/:id
DELETE /api/admin/variants/:id
POST   /api/admin/variants/:id/images
PATCH  /api/admin/images/:id        (position)
DELETE /api/admin/images/:id
GET    /api/admin/categories
POST   /api/admin/categories
PATCH  /api/admin/categories/:id
DELETE /api/admin/categories/:id
POST   /api/admin/uploads
DELETE /api/admin/uploads/:publicId(*)
PATCH  /api/users/me                (profil admin : e-mail, mot de passe)
```

Toutes les routes `/api/admin/*` sont protégées par `JwtAuthGuard` + `RolesGuard` + `@Roles("ADMIN")`.

---

## 8. Variables d'environnement

`backend/.env` (validées au démarrage par Zod — l'application refuse de démarrer si une variable
obligatoire manque) :

```
DATABASE_URL=            (obligatoire)
PORT=4000
CORS_ORIGIN=             (obligatoire, liste séparée par des virgules, sans slash final)
JWT_ACCESS_SECRET=       (min. 16 caractères)
JWT_REFRESH_SECRET=      (min. 16 caractères)
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
CLIENT_APP_URL=http://localhost:8080
ADMIN_APP_URL=http://localhost:8081
CLOUDINARY_CLOUD_NAME=   (optionnel : sans lui, seul l'envoi d'images échoue, avec un message clair)
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Pas de `WHATSAPP_NUMBER` côté backend : l'API ne construit aucun message et ne sert jamais ce numéro.
Deux copies dans deux fichiers finiraient par diverger — source unique, côté front.

`client/.env` : `VITE_API_URL`, `VITE_WHATSAPP_NUMBER` (format international sans `+` ni espaces,
ex. `221770000000`).
`admin/.env` : `VITE_API_URL`.

---

## 9. Déploiement visé

- **backend** sur Render (base PostgreSQL hébergée sur Neon) ;
- **client** sur un projet Vercel avec le domaine de la marque (domaine nu + www) ;
- **admin** sur un **second** projet Vercel séparé, laissé sur son adresse `*.vercel.app` (outil
  interne, pas de domaine acheté).

⚠️ Point de vigilance : `CORS_ORIGIN` sur Render doit lister **toutes** ces origines, séparées par des
virgules et sans slash final (le domaine nu et le `www.` comptent comme deux origines distinctes).
Toute nouvelle adresse de déploiement doit y être ajoutée, sinon les requêtes échouent en erreur CORS.

---

## 10. Ce qu'il ne faut PAS construire

- aucun module de paiement, aucun fournisseur, aucun webhook, aucun modèle `Payment` ;
- aucun compte client, aucune inscription, aucun panier ni favori côté serveur, aucune adresse ;
- aucun modèle `Order` / `OrderItem` : la commande vit dans la conversation WhatsApp ;
- aucun envoi d'e-mail, aucun gabarit d'e-mail, aucune facture PDF, aucune newsletter ;
- aucune page admin « Clients », « Commandes » ou « Newsletter ».

Le stock est saisi et corrigé à la main par l'administratrice depuis la fiche produit ; un produit
dont toutes les variantes sont à 0 s'affiche « Épuisé » côté client et son bouton WhatsApp est désactivé.

Conséquence assumée : sans modèle `Order`, **le stock ne se décrémente jamais tout seul**. Deux
clientes peuvent commander la dernière pièce, et c'est la vendeuse qui arbitre dans la conversation.
La fiche produit ne doit donc pas afficher un stock chiffré comme une promesse : au-dessus de 3,
rien ; entre 1 et 3, « Dernières pièces » ; à 0, « Épuisé ».

---

## 11. Qualité attendue

- TypeScript strict des deux côtés, aucun `any` implicite.
- Interface entièrement en français, responsive en pensant d'abord au mobile, états de chargement en
  squelettes, erreurs affichées en toasts `sonner` avec un message compréhensible.
- Tests `vitest` sur la logique sensible : construction du message WhatsApp (format lisible, bascule
  en format compact, échappement), calcul des totaux, règles de stock, revalidation du panier.
  Côté backend, `vitest` exige `reflect-metadata` et un transformeur qui conserve les décorateurs
  (`unplugin-swc`) : cette configuration se pose à l'étape 2, pas au moment du premier test.
- Un `README.md` par dossier : installation, variables d'environnement, commandes de développement,
  procédure de création du compte administrateur.

---

## 12. Ordre de construction (à suivre étape par étape)

1. **Créer les trois dossiers** `backend/`, `client/`, `admin/` et initialiser git à la racine.
2. **Backend, squelette** : `nest new`, puis `main.ts`, `app.module.ts`, `env.validation.ts`,
   `PrismaModule`, le filtre d'exception, le pipe Zod, la route `GET /api/health`. Vérifier que
   l'API démarre sur `http://localhost:4000/api/health`.
3. **Base de données** : écrire `prisma/schema.prisma` (section 3), lancer `prisma migrate dev`,
   écrire `prisma/seed.ts` avec 2 catégories et 3 produits de démonstration.
4. **Authentification admin** : module `auth` complet (login, refresh, logout, me), `JwtAuthGuard`,
   `RolesGuard`, décorateur `@Roles`, puis le script `prisma/create-admin.ts`. Tester la connexion
   avec curl avant de toucher au front.
5. **API publique** : modules `categories` et `products` (liste filtrée, fiche par slug,
   `POST /api/cart/validate`).
6. **API admin** : `admin/categories`, `admin/products` (produits, variantes, images),
   `admin/uploads` (Cloudinary), `admin/dashboard`.
7. **Admin front** : Vite + Tailwind + tokens, `lib/api.ts`, `AdminAuthContext`, `ProtectedRoute`,
   `AdminLayout`, puis dans l'ordre : page Connexion → Catégories → Liste produits →
   Formulaire produit avec variantes et images → Tableau de bord → Profil.
   À la fin de cette étape, la vendeuse doit pouvoir créer un produit complet avec ses photos.
8. **Message WhatsApp, avant l'interface** : `src/lib/whatsapp.ts` (construction du message, bascule
   lisible → compact, fabrication du lien) et ses tests `vitest`. C'est une fonction pure : la tester
   d'abord évite de figer le mauvais format dans les composants.
9. **Client front** : Vite + Tailwind + mêmes tokens, `lib/api.ts`, `CartContext` (localStorage +
   revalidation via `POST /api/cart/validate`), composants `Header`, `Footer`, `Reveal`, `Skeleton`,
   `ProductCard`, puis les pages :
   Collection → Fiche produit → Panier → Accueil → pages éditoriales → Contact → 404.
10. **Bouton WhatsApp** : composant `WhatsAppOrderButton` — un `<a>`, jamais un `onClick` asynchrone —
    réutilisé sur la fiche produit, dans le panier et en bouton flottant.
11. **Mise en ligne** : backend sur Render, client et admin sur deux projets Vercel séparés,
    renseigner `CORS_ORIGIN` avec toutes les adresses, créer le compte administrateur en production.
