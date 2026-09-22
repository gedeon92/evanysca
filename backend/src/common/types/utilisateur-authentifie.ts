import type { Role } from "@prisma/client";

// Ce que le JWT permet de reconstituer, et rien de plus : aucune requête en base sur les routes
// protégées ordinaires.
export type UtilisateurAuthentifie = {
  id: string;
  email: string;
  role: Role;
};
