import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // Le compteur ne porte que sur les produits actifs : c'est lui qui permet au filtre de la page
  // Collection de ne pas proposer une catégorie qui renverrait une grille vide.
  async lister() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    return categories.map(({ _count, ...categorie }) => ({
      ...categorie,
      productCount: _count.products,
    }));
  }
}
