import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async resume() {
    // Un produit est en rupture si toutes ses variantes sont à zéro — ou s'il n'en a aucune,
    // cas d'une fiche créée mais pas encore terminée, qu'il faut justement faire remonter.
    const conditionRupture = {
      OR: [{ variants: { none: {} } }, { variants: { every: { stock: { lte: 0 } } } }],
    };

    const [produits, produitsActifs, categories, enRupture, derniersAjouts] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.category.count(),
      this.prisma.product.count({ where: conditionRupture }),
      this.prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          isActive: true,
          createdAt: true,
          category: { select: { name: true } },
          variants: {
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { images: { orderBy: { position: "asc" }, take: 1, select: { url: true } } },
          },
        },
      }),
    ]);

    return {
      productCount: produits,
      activeProductCount: produitsActifs,
      inactiveProductCount: produits - produitsActifs,
      categoryCount: categories,
      outOfStockCount: enRupture,
      latestProducts: derniersAjouts.map(({ variants, ...produit }) => ({
        ...produit,
        image: variants[0]?.images[0]?.url ?? null,
      })),
    };
  }
}
