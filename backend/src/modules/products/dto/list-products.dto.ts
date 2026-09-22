import { z } from "zod";

export const schemaListeProduits = z.object({
  search: z.string().trim().max(120).optional(),
  // La catégorie est filtrée par slug, pas par identifiant : c'est ce que porte l'URL du site
  // (/collection?categorie=sacs), et ça reste lisible dans la barre d'adresse.
  category: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  // Plafond volontaire : sans lui, un ?limit=100000 ferait tomber l'API depuis l'extérieur.
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type ListeProduitsDto = z.infer<typeof schemaListeProduits>;
