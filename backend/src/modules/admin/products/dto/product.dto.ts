import { z } from "zod";

const texteEditorial = z.string().trim().min(1, "Ce champ est obligatoire.").max(5000);

// Champs sans valeur par défaut : la création les complète, la mise à jour les rend tous
// facultatifs. Les définir une seule fois évite que les deux schémas divergent avec le temps.
const champsProduit = {
  categoryId: z.string().uuid("Catégorie invalide."),
  line: z.string().trim().min(1, "La ligne est obligatoire.").max(80),
  name: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères.").max(120),
  slug: z.string().trim().max(120),
  ref: z.string().trim().min(1, "La référence est obligatoire.").max(60),
  displayOrder: z.coerce.number().int().min(0),
  // Entier strict : le FCFA n'a pas de sous-unité, et un flottant n'apporterait que des arrondis.
  price: z.coerce.number().int("Le prix doit être un entier.").min(0, "Le prix ne peut pas être négatif."),
  detail: texteEditorial,
  shortDescription: texteEditorial,
  story: texteEditorial,
  designIntent: texteEditorial,
  materials: texteEditorial,
  craftsmanship: texteEditorial,
  care: texteEditorial,
  tag: z.string().trim().max(40).nullable(),
  isActive: z.boolean(),
};

export const schemaCreationProduit = z.object({
  ...champsProduit,
  slug: champsProduit.slug.optional(),
  tag: champsProduit.tag.optional(),
  displayOrder: champsProduit.displayOrder.default(0),
  isActive: champsProduit.isActive.default(true),
});

export const schemaMiseAJourProduit = z
  .object(champsProduit)
  .partial()
  .refine((valeurs) => Object.keys(valeurs).length > 0, "Aucune modification transmise.");

export const schemaListeProduitsAdmin = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  // Contrairement au catalogue public, l'admin doit pouvoir isoler les fiches désactivées.
  status: z.enum(["all", "active", "inactive"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreationProduitDto = z.infer<typeof schemaCreationProduit>;
export type MiseAJourProduitDto = z.infer<typeof schemaMiseAJourProduit>;
export type ListeProduitsAdminDto = z.infer<typeof schemaListeProduitsAdmin>;
