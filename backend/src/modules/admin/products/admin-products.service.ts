import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CloudinaryService } from "../../../common/cloudinary/cloudinary.service";
import { fabriquerSlug } from "../../../common/utils/slug";
import { PrismaService } from "../../../prisma/prisma.service";
import type { CreationProduitDto, ListeProduitsAdminDto, MiseAJourProduitDto } from "./dto/product.dto";
import type { AjoutImageDto, CreationVarianteDto, MiseAJourVarianteDto } from "./dto/variant.dto";

const categorieResumee = { select: { id: true, name: true, slug: true } };
const variantesCompletes = {
  orderBy: { createdAt: "asc" as const },
  include: { images: { orderBy: { position: "asc" as const } } },
};

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async lister({ search, category, status, page, limit }: ListeProduitsAdminDto) {
    const where: Prisma.ProductWhereInput = {
      // Contrairement au catalogue public, rien n'est masqué par défaut : la vendeuse doit voir
      // ses fiches désactivées, sinon elle ne peut plus les retrouver pour les réactiver.
      ...(status === "all" ? {} : { isActive: status === "active" }),
      ...(category ? { OR: [{ category: { slug: category } }, { categoryId: category }] } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { line: { contains: search, mode: "insensitive" } },
              { ref: { contains: search, mode: "insensitive" } },
              // Le SKU est cherchable ici alors qu'il ne sort jamais du catalogue public : c'est
              // souvent la seule chose qu'on a sous les yeux en regardant une étiquette.
              { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };

    const [total, produits] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: categorieResumee,
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
        ref: produit.ref,
        line: produit.line,
        price: produit.price,
        displayOrder: produit.displayOrder,
        isActive: produit.isActive,
        category: produit.category,
        image: produit.variants[0]?.images[0]?.url ?? null,
        variantCount: produit.variants.length,
        totalStock: produit.variants.reduce((somme, variante) => somme + Math.max(0, variante.stock), 0),
        createdAt: produit.createdAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async parId(id: string) {
    const produit = await this.prisma.product.findUnique({
      where: { id },
      include: { category: categorieResumee, variants: variantesCompletes },
    });

    if (!produit) throw new NotFoundException("Ce produit n'existe pas.");
    return produit;
  }

  async creer({ slug, ...champs }: CreationProduitDto) {
    await this.verifierCategorie(champs.categoryId);

    return this.prisma.product.create({
      data: { ...champs, slug: fabriquerSlug(slug || champs.name) },
      include: { category: categorieResumee, variants: variantesCompletes },
    });
  }

  async mettreAJour(id: string, { slug, ...champs }: MiseAJourProduitDto) {
    await this.parId(id);
    if (champs.categoryId) await this.verifierCategorie(champs.categoryId);

    return this.prisma.product.update({
      where: { id },
      data: { ...champs, ...(slug !== undefined ? { slug: fabriquerSlug(slug) } : {}) },
      include: { category: categorieResumee, variants: variantesCompletes },
    });
  }

  async supprimer(id: string) {
    const produit = await this.parId(id);

    // Les variantes et les images tombent en cascade côté base, mais les fichiers distants, eux,
    // ne disparaissent pas tout seuls : sans ce nettoyage le quota Cloudinary se remplirait
    // d'orphelins que plus rien ne référence.
    const publicIds = produit.variants.flatMap((variante) => variante.images.map((image) => image.publicId));

    await this.prisma.product.delete({ where: { id } });
    await Promise.all(publicIds.map((publicId) => this.cloudinary.supprimerSansEchouer(publicId)));

    return { message: "Produit supprimé." };
  }

  async ajouterVariante(produitId: string, donnees: CreationVarianteDto) {
    await this.parId(produitId);

    return this.prisma.productVariant.create({
      data: { ...donnees, productId: produitId },
      include: { images: { orderBy: { position: "asc" } } },
    });
  }

  async mettreAJourVariante(id: string, donnees: MiseAJourVarianteDto) {
    await this.trouverVariante(id);

    return this.prisma.productVariant.update({
      where: { id },
      data: donnees,
      include: { images: { orderBy: { position: "asc" } } },
    });
  }

  async supprimerVariante(id: string) {
    const variante = await this.trouverVariante(id);
    const publicIds = variante.images.map((image) => image.publicId);

    await this.prisma.productVariant.delete({ where: { id } });
    await Promise.all(publicIds.map((publicId) => this.cloudinary.supprimerSansEchouer(publicId)));

    return { message: "Teinte supprimée." };
  }

  async ajouterImage(varianteId: string, { url, publicId, position }: AjoutImageDto) {
    const variante = await this.trouverVariante(varianteId);

    // Sans position explicite, l'image se place à la fin de la galerie : c'est l'ordre auquel on
    // s'attend après un glisser-déposer.
    const positionSouhaitee = position ?? variante.images.length;

    await this.prisma.productImage.create({
      data: { variantId: varianteId, url, publicId: publicId ?? null, position: positionSouhaitee },
    });

    return this.renumeroter(varianteId);
  }

  async deplacerImage(id: string, position: number) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException("Cette image n'existe pas.");

    const galerie = await this.prisma.productImage.findMany({
      where: { variantId: image.variantId },
      orderBy: { position: "asc" },
    });

    const autres = galerie.filter((element) => element.id !== id);
    const cible = Math.min(Math.max(0, position), autres.length);
    autres.splice(cible, 0, image);

    await this.prisma.$transaction(
      autres.map((element, index) =>
        this.prisma.productImage.update({ where: { id: element.id }, data: { position: index } }),
      ),
    );

    return { images: autres.map((element, index) => ({ ...element, position: index })) };
  }

  async supprimerImage(id: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException("Cette image n'existe pas.");

    await this.prisma.productImage.delete({ where: { id } });
    await this.cloudinary.supprimerSansEchouer(image.publicId);

    return this.renumeroter(image.variantId);
  }

  // Réécrit les positions en 0, 1, 2… Les laisser se trouer après une suppression (0, 2, 5)
  // rendrait tout déplacement ultérieur imprévisible.
  private async renumeroter(varianteId: string) {
    const galerie = await this.prisma.productImage.findMany({
      where: { variantId: varianteId },
      orderBy: { position: "asc" },
    });

    const desordonnee = galerie.some((image, index) => image.position !== index);

    if (desordonnee) {
      await this.prisma.$transaction(
        galerie.map((image, index) =>
          this.prisma.productImage.update({ where: { id: image.id }, data: { position: index } }),
        ),
      );
    }

    return { images: galerie.map((image, index) => ({ ...image, position: index })) };
  }

  private async trouverVariante(id: string) {
    const variante = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    });

    if (!variante) throw new NotFoundException("Cette teinte n'existe pas.");
    return variante;
  }

  private async verifierCategorie(categoryId: string) {
    const categorie = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!categorie) throw new NotFoundException("Cette catégorie n'existe pas.");
    return categorie;
  }
}
