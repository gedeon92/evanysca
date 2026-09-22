import { z } from "zod";

// Le schéma est volontairement strict : une API qui démarre avec une variable manquante tombe en
// panne bien plus tard, en production, sur une requête déjà partie chez un client.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "obligatoire"),

  // Connexion directe, sans pooler : utilisée uniquement par `prisma migrate`, jamais au runtime.
  // Optionnelle, parce qu'un PostgreSQL local n'a pas de pooler devant lui.
  DIRECT_URL: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(4000),

  // Une origine avec un slash final ne correspondra jamais à l'en-tête Origin envoyé par le
  // navigateur : la requête échouerait en erreur CORS sans message exploitable.
  CORS_ORIGIN: z
    .string()
    .min(1, "obligatoire")
    .refine(
      (valeur) => valeur.split(",").every((origine) => !origine.trim().endsWith("/")),
      "les origines ne doivent pas se terminer par un slash",
    ),

  JWT_ACCESS_SECRET: z.string().min(16, "au moins 16 caractères"),
  JWT_REFRESH_SECRET: z.string().min(16, "au moins 16 caractères"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  CLIENT_APP_URL: z.string().url().default("http://localhost:8080"),
  ADMIN_APP_URL: z.string().url().default("http://localhost:8081"),

  // Cloudinary reste optionnel : sans lui, seul l'envoi d'images échoue, avec un message clair.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(configuration: Record<string, unknown>): Env {
  const resultat = envSchema.safeParse(configuration);

  if (!resultat.success) {
    // Toutes les variables fautives d'un coup : les corriger une par une, redémarrage après
    // redémarrage, coûte plus cher que le message lui-même.
    const details = Object.entries(resultat.error.flatten().fieldErrors)
      .map(([variable, erreurs]) => `  - ${variable} : ${(erreurs ?? []).join(", ")}`)
      .join("\n");

    throw new Error(`Configuration invalide dans backend/.env :\n${details}`);
  }

  return resultat.data;
}
