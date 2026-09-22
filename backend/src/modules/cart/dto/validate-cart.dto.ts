import { z } from "zod";

export const schemaValidationPanier = z.object({
  variantIds: z
    .array(z.string().uuid("Identifiant de variante invalide."))
    .min(1, "Le panier est vide.")
    // Plafond de sécurité : le panier vient du navigateur, donc d'une source non fiable.
    .max(100, "Trop d'articles dans le panier."),
});

export type ValidationPanierDto = z.infer<typeof schemaValidationPanier>;
