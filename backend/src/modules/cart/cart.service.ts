import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type LignePanierValidee = {
  variantId: string;
  exists: boolean;
  isActive: boolean;
  price: number | null;
  stock: number;
  name: string | null;
  color: string | null;
  productSlug: string | null;
  image: string | null;
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Le panier vit dans le localStorage de la cliente et peut y dormir des semaines : entre-temps
  // un prix change, une teinte disparaît, un produit est désactivé. Sans cette revalidation, la
  // commande partirait sur WhatsApp avec un montant que la vendeuse ne pourrait pas honorer.
  async valider(variantIds: string[]): Promise<{ items: LignePanierValidee[] }> {
    const identifiantsUniques = [...new Set(variantIds)];

    const variantes = await this.prisma.productVariant.findMany({
      where: { id: { in: identifiantsUniques } },
      include: {
        product: { select: { name: true, slug: true, price: true, isActive: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    });

    const parIdentifiant = new Map(variantes.map((variante) => [variante.id, variante]));

    // On répond dans l'ordre demandé, y compris pour les variantes introuvables : le front
    // recoupe ligne à ligne sans avoir à deviner laquelle a disparu.
    const items = identifiantsUniques.map<LignePanierValidee>((variantId) => {
      const variante = parIdentifiant.get(variantId);

      if (!variante) {
        return {
          variantId,
          exists: false,
          isActive: false,
          price: null,
          stock: 0,
          name: null,
          color: null,
          productSlug: null,
          image: null,
        };
      }

      return {
        variantId,
        exists: true,
        isActive: variante.product.isActive,
        // Le prix fait foi côté serveur : celui gardé dans le navigateur n'est qu'un affichage.
        price: variante.product.price,
        stock: Math.max(0, variante.stock),
        name: variante.product.name,
        color: variante.colorName,
        productSlug: variante.product.slug,
        image: variante.images[0]?.url ?? null,
      };
    });

    return { items };
  }
}
