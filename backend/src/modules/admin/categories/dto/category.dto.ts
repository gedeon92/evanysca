import { z } from "zod";

const nom = z
  .string()
  .trim()
  .min(2, "Le nom doit faire au moins 2 caractères.")
  .max(60, "Le nom ne peut pas dépasser 60 caractères.");

export const schemaCreationCategorie = z.object({
  name: nom,
  // Laissé vide, le slug est fabriqué à partir du nom : la vendeuse n'a pas à savoir ce qu'est
  // un slug pour créer une catégorie.
  slug: z.string().trim().max(80).optional(),
});

export const schemaMiseAJourCategorie = z
  .object({ name: nom.optional(), slug: z.string().trim().max(80).optional() })
  .refine((valeurs) => Object.keys(valeurs).length > 0, "Aucune modification transmise.");

export type CreationCategorieDto = z.infer<typeof schemaCreationCategorie>;
export type MiseAJourCategorieDto = z.infer<typeof schemaMiseAJourCategorie>;
