import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { ListeProduitsDto } from "./dto/list-products.dto";

// Un produit n'est commandable que si au moins une de ses teintes a du stock.
const estEpuise = (variantes: { stock: number }[]) =>
  variantes.length === 0 || variantes.every((variante) => variante.stock <= 0);

const stockTotal = (variantes: { stock: number }[]) =>
  variantes.reduce((total, variante) => total + Math.max(0, variante.stock), 0);

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async lister({ search, category, page, limit }: ListeProduitsDto) {
    const where: Prisma.ProductWhereInput = {
      // Le catalogue public ne montre jamais un produit désactivé, quel que soit le filtre.
      isActive: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { line: { contains: search, mode: "insensitive" } },
              { ref: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    // Une seule transaction pour le total et la page : entre deux requêtes séparées, une
    // création de produit ferait afficher une pagination incohérente.
    const [total, produits] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          variants: {
            orderBy: { createdAt: "asc" },
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
        },
      }),
    ]);

    return {
      items: produits.map((produit) => ({
        id: produit.id,
        name: produit.name,
        slug: produit.slug,
        line: produit.line,
        price: produit.price,
        tag: produit.tag,
        shortDescription: produit.shortDescription,
        category: produit.category,
        image: produit.variants[0]?.images[0]?.url ?? null,
        swatches: produit.variants.map((variante) => ({
          colorName: variante.colorName,
          swatchHex: variante.swatchHex,
        })),
        totalStock: stockTotal(produit.variants),
        isSoldOut: estEpuise(produit.variants),
      })),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async parSlug(slug: string) {
    const produit = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        variants: {
          orderBy: { createdAt: "asc" },
          include: { images: { orderBy: { position: "asc" } } },
        },
      },
    });

    if (!produit) throw new NotFoundException("Ce produit n'existe pas ou n'est plus disponible.");

    return {
      ...produit,
      variants: produit.variants.map((variante) => ({
        id: variante.id,
        colorName: variante.colorName,
        swatchHex: variante.swatchHex,
        // Le SKU ne sort pas de l'admin : il n'a aucune utilité pour la cliente.
        stock: variante.stock,
        isSoldOut: variante.stock <= 0,
        images: variante.images.map((image) => ({ id: image.id, url: image.url, position: image.position })),
      })),
      totalStock: stockTotal(produit.variants),
      isSoldOut: estEpuise(produit.variants),
    };
  }
}
