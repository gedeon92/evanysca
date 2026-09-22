import { z } from "zod";

const champsVariante = {
  colorName: z.string().trim().min(1, "Le nom de la teinte est obligatoire.").max(60),
  // Format strict : la pastille est injectée telle quelle dans un style CSS côté front.
  swatchHex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur attendue au format #RRGGBB."),
  sku: z.string().trim().min(1, "Le SKU est obligatoire.").max(60),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif."),
};

export const schemaCreationVariante = z.object({
  ...champsVariante,
  stock: champsVariante.stock.default(0),
});

export const schemaMiseAJourVariante = z
  .object(champsVariante)
  .partial()
  .refine((valeurs) => Object.keys(valeurs).length > 0, "Aucune modification transmise.");

export const schemaAjoutImage = z.object({
  url: z.string().url("URL d'image invalide."),
  // Renseigné quand l'image vient de POST /api/admin/uploads : c'est lui qui permettra de
  // supprimer le fichier distant quand la ligne disparaîtra de la base.
  publicId: z.string().trim().max(200).nullable().optional(),
  position: z.coerce.number().int().min(0).optional(),
});

export const schemaPositionImage = z.object({
  position: z.coerce.number().int().min(0),
});

export type CreationVarianteDto = z.infer<typeof schemaCreationVariante>;
export type MiseAJourVarianteDto = z.infer<typeof schemaMiseAJourVariante>;
export type AjoutImageDto = z.infer<typeof schemaAjoutImage>;
export type PositionImageDto = z.infer<typeof schemaPositionImage>;
