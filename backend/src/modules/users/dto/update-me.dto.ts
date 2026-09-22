import { z } from "zod";

export const schemaMiseAJourProfil = z
  .object({
    email: z.string().trim().email("Adresse e-mail invalide.").optional(),
    firstName: z.string().trim().min(1).max(60).optional(),
    lastName: z.string().trim().min(1).max(60).optional(),
    phone: z.string().trim().max(30).nullable().optional(),

    // Le mot de passe actuel n'est exigé que pour en changer : modifier son prénom ne doit pas
    // obliger à le ressaisir.
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(10, "Le nouveau mot de passe doit faire au moins 10 caractères.")
      .max(200)
      .optional(),
  })
  .refine((valeurs) => Object.keys(valeurs).length > 0, "Aucune modification transmise.")
  .refine((valeurs) => !valeurs.newPassword || Boolean(valeurs.currentPassword), {
    message: "Le mot de passe actuel est obligatoire pour en choisir un nouveau.",
    path: ["currentPassword"],
  });

export type MiseAJourProfilDto = z.infer<typeof schemaMiseAJourProfil>;
