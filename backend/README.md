# backend — API de la boutique

API NestJS 10 + Prisma 5 + PostgreSQL. Aucun paiement, aucun compte client, aucune commande en
base : la commande vit dans la conversation WhatsApp. L'API ne sert que le catalogue public et le
back-office de la vendeuse.

## Installation

```bash
npm install          # génère aussi le client Prisma (postinstall)
cp .env.example .env # puis renseigner DATABASE_URL et les deux secrets JWT
npm run prisma:migrate
npm run db:seed
npm run start:dev
```

L'API écoute sur `http://localhost:4000/api`.

## Variables d'environnement

Elles sont validées par Zod au démarrage : si l'une manque ou est invalide, l'application refuse de
démarrer et **liste toutes les variables fautives d'un coup**.

| Variable | Obligatoire | Détail |
| --- | --- | --- |
| `DATABASE_URL` | oui | PostgreSQL. Sur Neon : la chaîne **pooled** (hôte en `-pooler`) |
| `DIRECT_URL` | non | La même **sans** `-pooler`, utilisée seulement par `prisma migrate` |
| `PORT` | non | `4000` par défaut |
| `NODE_ENV` | non | `development` par défaut |
| `CORS_ORIGIN` | oui | origines séparées par des virgules, **sans slash final** |
| `JWT_ACCESS_SECRET` | oui | 16 caractères minimum |
| `JWT_REFRESH_SECRET` | oui | 16 caractères minimum |
| `JWT_ACCESS_TTL` | non | `15m` |
| `JWT_REFRESH_TTL` | non | `30d` |
| `CLIENT_APP_URL` | non | `http://localhost:8080` |
| `ADMIN_APP_URL` | non | `http://localhost:8081` |
| `CLOUDINARY_*` | non | sans elles, seul l'envoi d'images échoue |

Pas de `WHATSAPP_NUMBER` ici : l'API ne construit aucun message. Le numéro vit dans
`client/.env` (`VITE_WHATSAPP_NUMBER`), source unique.

`CORS_ORIGIN` doit lister **toutes** les adresses de déploiement. Le domaine nu et le `www.`
comptent comme deux origines distinctes ; une origine avec un slash final ne correspondra jamais à
l'en-tête `Origin` envoyé par le navigateur (le schéma Zod la refuse au démarrage).

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run start:dev` | API en mode watch |
| `npm run build` / `npm run start:prod` | compilation puis exécution de `dist/` |
| `npm test` | tests Vitest |
| `npm run prisma:migrate` | migration de développement |
| `npm run prisma:studio` | exploration de la base |
| `npm run db:seed` | 2 catégories et 3 produits de démonstration (relançable) |

## Endpoints disponibles

### Public

| Méthode | Route | Détail |
| --- | --- | --- |
| `GET` | `/api/health` | état de l'API et de la base (`up` / `down`) |
| `GET` | `/api/categories` | catégories + nombre de produits **actifs** |
| `GET` | `/api/products` | `?search=` `?category=<slug>` `?page=` `?limit=` (max 48) |
| `GET` | `/api/products/:slug` | fiche complète, variantes et galeries triées |
| `POST` | `/api/cart/validate` | revalidation du panier local |

Le catalogue public ne renvoie **jamais** un produit `isActive: false`, ni le `sku` des variantes,
qui ne sert qu'à l'admin.

`POST /api/cart/validate` reçoit `{ variantIds: string[] }` et renvoie, dans le même ordre, une
ligne par variante : `{ variantId, exists, isActive, price, stock, name, color, productSlug, image }`.
Le prix renvoyé fait foi — celui conservé dans le `localStorage` n'est qu'un affichage, et un panier
peut y dormir des semaines pendant que le tarif change.

### Authentification

| Méthode | Route | Détail |
| --- | --- | --- |
| `POST` | `/api/auth/admin-login` | 5 tentatives/minute |
| `POST` | `/api/auth/admin-refresh` | lit le cookie, fait tourner le jeton |
| `POST` | `/api/auth/admin-logout` | révoque le jeton et efface le cookie |
| `GET` | `/api/auth/me` | profil de l'admin connecté |

### Administration

Toutes ces routes exigent `JwtAuthGuard` + `RolesGuard` + `@Roles("ADMIN")`.

| Méthode | Route | Détail |
| --- | --- | --- |
| `GET` | `/api/admin/dashboard` | compteurs + 5 derniers produits |
| `GET` `POST` | `/api/admin/categories` | le slug est fabriqué depuis le nom si absent |
| `PATCH` `DELETE` | `/api/admin/categories/:id` | suppression refusée si des produits l'utilisent |
| `GET` | `/api/admin/products` | `?status=all\|active\|inactive`, recherche aussi par SKU |
| `GET` `POST` | `/api/admin/products` `/:id` | fiche complète avec teintes et galeries |
| `PATCH` `DELETE` | `/api/admin/products/:id` | |
| `POST` | `/api/admin/products/:id/variants` | ajoute une teinte |
| `PATCH` `DELETE` | `/api/admin/variants/:id` | |
| `POST` | `/api/admin/variants/:id/images` | ajoute à la fin de la galerie |
| `PATCH` `DELETE` | `/api/admin/images/:id` | déplacement par `position`, renumérotation automatique |
| `POST` | `/api/admin/uploads` | 5 Mo max, JPEG/PNG/WebP |
| `DELETE` | `/api/admin/uploads/:publicId(*)` | refuse tout identifiant hors préfixe |
| `PATCH` | `/api/users/me` | e-mail, identité, mot de passe |

Quelques règles que le code applique et que les tests couvrent :

- supprimer un produit ou une teinte supprime aussi **les fichiers distants sur Cloudinary** — en
  cascade la base seule laisserait des orphelins qui remplissent le quota ;
- les positions d'images sont toujours réécrites en `0, 1, 2…` : les laisser se trouer rendrait
  tout déplacement ultérieur imprévisible ;
- changer de mot de passe via `PATCH /api/users/me` exige le mot de passe actuel et **révoque
  toutes les sessions ouvertes** ;
- sans variables `CLOUDINARY_*`, l'envoi d'images répond **503 avec un message explicite**, jamais
  un 500 opaque — et le reste de l'API fonctionne normalement.

## Compte administrateur

Aucun e-mail n'est envoyé dans le projet : ni inscription, ni « mot de passe oublié ». Les comptes
se créent et se réparent en ligne de commande.

```bash
npm run admin:create -- vendeuse@exemple.com "MotDePasseSolide2025" Awa Diop
npm run admin:reset-password -- vendeuse@exemple.com "NouveauMotDePasse2025"
```

La réinitialisation révoque au passage toutes les sessions ouvertes sur les autres appareils.

## Points d'attention

- **`trust proxy`** est activé dans `main.ts` : derrière le proxy de Render, sans cette option, le
  rate limiting s'appliquerait globalement au lieu d'être compté par client.
- **`PrismaService` ne fait pas tomber l'API si la base est injoignable en développement** : il
  loggue un avertissement et `GET /api/health` renvoie `database: "down"`, pour pouvoir travailler
  sur les fronts sans PostgreSQL. En `NODE_ENV=production`, l'application refuse de démarrer.
- **Validation** : jamais de `class-validator`. Un schéma Zod par DTO, appliqué via
  `@UsePipes(new ZodValidationPipe(schema))`.
- **Erreurs Prisma** : `HttpExceptionFilter` traduit `P2002` en 409 avec le champ fautif (`ref` et
  `sku` sont saisis à la main, la collision est courante), `P2025` en 404, `P2003` en 409.
- **Vitest** passe par `unplugin-swc` : esbuild effacerait les métadonnées de type dont dépend
  l'injection de dépendances NestJS. La configuration s'appelle `vitest.config.**mts**` et non
  `.ts` — `unplugin-swc` est un module ESM, et dans un projet CommonJS Vitest échouerait sur un
  `ERR_REQUIRE_ESM` avant même de lancer le premier test.
- **Authentification** : le jeton d'accès (15 min) repart dans le corps de la réponse, jamais dans
  un cookie — le front le garde en mémoire JavaScript. Le jeton de rafraîchissement vit dans un
  cookie `httpOnly` limité au chemin `/api/auth`, stocké **haché en SHA-256** en base. Chaque
  rafraîchissement fait tourner le jeton ; rejouer un jeton déjà utilisé révoque **toutes** les
  sessions du compte, parce qu'on ne peut pas distinguer l'appareil légitime du voleur.
