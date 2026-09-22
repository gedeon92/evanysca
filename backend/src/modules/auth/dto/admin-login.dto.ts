import { z } from "zod";

export const schemaConnexionAdmin = z.object({
  email: z.string().min(1, "L'adresse e-mail est obligatoire.").email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

export type ConnexionAdminDto = z.infer<typeof schemaConnexionAdmin>;
