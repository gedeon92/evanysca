import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { fabriquerSlug } from "../../../common/utils/slug";
import { PrismaService } from "../../../prisma/prisma.service";
import type { CreationCategorieDto, MiseAJourCategorieDto } from "./dto/category.dto";

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // Contrairement au catalogue public, l'admin compte TOUS les produits, désactivés compris :
  // c'est ce compteur qui explique pourquoi une suppression est refusée.
  async lister() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return {
      items: categories.map(({ _count, ...categorie }) => ({
        ...categorie,
        productCount: _count.products,
      })),
    };
  }

  async creer({ name, slug }: CreationCategorieDto) {
    return this.prisma.category.create({
      data: { name, slug: fabriquerSlug(slug || name) },
    });
  }

  async mettreAJour(id: string, { name, slug }: MiseAJourCategorieDto) {
    await this.trouverOuEchouer(id);

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(slug !== undefined ? { slug: fabriquerSlug(slug) } : {}),
      },
    });
  }

  async supprimer(id: string) {
    const categorie = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!categorie) throw new NotFoundException("Cette catégorie n'existe pas.");

    // Vérification explicite plutôt que de laisser remonter la violation de clé étrangère : le
    // message doit dire combien de produits bloquent, sinon la vendeuse ne sait pas quoi faire.
    if (categorie._count.products > 0) {
      throw new ConflictException(
        `Suppression impossible : ${categorie._count.products} produit(s) utilisent encore cette catégorie.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: "Catégorie supprimée." };
  }

  private async trouverOuEchouer(id: string) {
    const categorie = await this.prisma.category.findUnique({ where: { id } });
    if (!categorie) throw new NotFoundException("Cette catégorie n'existe pas.");
    return categorie;
  }
}
