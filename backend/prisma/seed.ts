import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Images de démonstration : des placeholders déterministes, remplacés par de vraies photos
// Cloudinary dès que la vendeuse saisit ses produits depuis l'admin.
const photo = (graine: string) => `https://picsum.photos/seed/${graine}/1200/1500`;

type VarianteDemo = {
  colorName: string;
  swatchHex: string;
  sku: string;
  stock: number;
  images: string[];
};

type ProduitDemo = {
  categorySlug: string;
  line: string;
  name: string;
  slug: string;
  ref: string;
  displayOrder: number;
  price: number;
  detail: string;
  shortDescription: string;
  story: string;
  designIntent: string;
  materials: string;
  craftsmanship: string;
  care: string;
  tag?: string;
  variants: VarianteDemo[];
};

const categories = [
  { name: "Sacs", slug: "sacs" },
  { name: "Bijoux", slug: "bijoux" },
];

const produits: ProduitDemo[] = [
  {
    categorySlug: "sacs",
    line: "Ligne Ogooué",
    name: "Sac Ambre",
    slug: "sac-ambre",
    ref: "SAC-AMB-01",
    displayOrder: 1,
    price: 165000,
    tag: "Nouveauté",
    shortDescription: "Un cabas structuré en cuir pleine fleur, porté main ou épaule.",
    detail:
      "Format cabas de 32 × 28 cm, doublure coton, une poche zippée intérieure et deux poches plates. Anses de 58 cm.",
    story:
      "Née d'un carnet de croquis rapporté du delta de l'Ogooué, cette ligne reprend la forme franche des malles de voyage.",
    designIntent:
      "Une silhouette qui tient debout seule, sans armature apparente : toute la structure vient du choix du cuir.",
    materials: "Cuir de vachette pleine fleur tannage végétal, doublure coton 100 %, laiton doré.",
    craftsmanship: "Coupe et montage à la main, coutures sellier au fil de lin ciré.",
    care: "Éviter l'exposition prolongée au soleil. Nourrir le cuir deux fois par an avec un lait incolore.",
    variants: [
      {
        colorName: "Noisette",
        swatchHex: "#A8763E",
        sku: "SAC-AMB-01-NOI",
        stock: 4,
        images: [photo("ambre-noisette-1"), photo("ambre-noisette-2")],
      },
      {
        colorName: "Noir Encre",
        swatchHex: "#1C1B1A",
        sku: "SAC-AMB-01-ENC",
        stock: 2,
        images: [photo("ambre-encre-1")],
      },
    ],
  },
  {
    categorySlug: "sacs",
    line: "Ligne Ogooué",
    name: "Sac Ondine",
    slug: "sac-ondine",
    ref: "SAC-OND-01",
    displayOrder: 2,
    price: 128000,
    shortDescription: "Une besace souple du soir, bandoulière amovible.",
    detail: "Format 24 × 18 cm, fermeture aimantée, une poche plate intérieure. Bandoulière réglable de 110 à 130 cm.",
    story: "Dessinée pour les soirées où l'on n'emporte que l'essentiel.",
    designIntent: "Le contraire du cabas : aucune structure, le cuir tombe seul.",
    materials: "Agneau plongé, doublure soie, fermoir laiton.",
    craftsmanship: "Assemblage à la main, bords teintés et lissés à chaud.",
    care: "Ranger dans son sac de protection, à plat, à l'abri de l'humidité.",
    // Stock à zéro sur l'unique variante : c'est le cas « Épuisé » à vérifier côté client.
    variants: [
      {
        colorName: "Sable",
        swatchHex: "#D8C3A5",
        sku: "SAC-OND-01-SAB",
        stock: 0,
        images: [photo("ondine-sable-1")],
      },
    ],
  },
  {
    categorySlug: "bijoux",
    line: "Ligne Clair",
    name: "Collier Lune",
    slug: "collier-lune",
    ref: "BIJ-LUN-01",
    displayOrder: 1,
    price: 45000,
    shortDescription: "Un pendentif croissant sur chaîne fine, porté seul ou superposé.",
    detail: "Pendentif de 18 mm, chaîne de 42 cm avec rallonge de 4 cm, fermoir mousqueton.",
    story: "Le premier bijou de la maison, dessiné en pendant du Sac Ambre.",
    designIntent: "Une seule courbe, aucune pierre : la lumière fait le reste.",
    materials: "Laiton doré à l'or fin 3 microns.",
    craftsmanship: "Fonte à la cire perdue, polissage main.",
    care: "Retirer avant la douche et le sport. Essuyer avec un chiffon doux après le port.",
    variants: [
      {
        colorName: "Or",
        swatchHex: "#C9A227",
        sku: "BIJ-LUN-01-OR",
        stock: 7,
        images: [photo("lune-or-1"), photo("lune-or-2")],
      },
      {
        colorName: "Argent",
        swatchHex: "#C0C0C0",
        sku: "BIJ-LUN-01-AR",
        stock: 3,
        images: [photo("lune-argent-1")],
      },
    ],
  },
];

async function main(): Promise<void> {
  // Le seed doit pouvoir être relancé sans erreur : tout passe par des upserts sur les clés
  // uniques, jamais par des create secs.
  for (const categorie of categories) {
    await prisma.category.upsert({
      where: { slug: categorie.slug },
      update: { name: categorie.name },
      create: categorie,
    });
  }

  for (const produit of produits) {
    const { categorySlug, variants, ...champs } = produit;

    const categorie = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });

    const enregistre = await prisma.product.upsert({
      where: { slug: champs.slug },
      update: { ...champs, categoryId: categorie.id },
      create: { ...champs, categoryId: categorie.id },
    });

    for (const variante of variants) {
      const { images, ...champsVariante } = variante;

      const varianteEnregistree = await prisma.productVariant.upsert({
        where: { sku: champsVariante.sku },
        update: { ...champsVariante, productId: enregistre.id },
        create: { ...champsVariante, productId: enregistre.id },
      });

      // Les images n'ont pas de clé naturelle : on repart d'une galerie propre à chaque seed.
      await prisma.productImage.deleteMany({ where: { variantId: varianteEnregistree.id } });
      await prisma.productImage.createMany({
        data: images.map((url, position) => ({ variantId: varianteEnregistree.id, url, position })),
      });
    }
  }

  const nbProduits = await prisma.product.count();
  const nbCategories = await prisma.category.count();
  console.log(`Seed terminé : ${nbCategories} catégories, ${nbProduits} produits.`);
}

main()
  .catch((erreur) => {
    console.error("Seed interrompu :", erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
