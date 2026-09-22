import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { UtilisateurAuthentifie } from "../types/utilisateur-authentifie";

// @CurrentUser() injecte l'utilisateur entier, @CurrentUser("id") uniquement son identifiant :
// la plupart des services n'ont besoin que de ça.
export const CurrentUser = createParamDecorator(
  (champ: keyof UtilisateurAuthentifie | undefined, contexte: ExecutionContext) => {
    const requete = contexte.switchToHttp().getRequest<Request & { user?: UtilisateurAuthentifie }>();
    const utilisateur = requete.user;

    if (!utilisateur) return undefined;
    return champ ? utilisateur[champ] : utilisateur;
  },
);
