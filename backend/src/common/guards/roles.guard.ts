import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@prisma/client";
import type { Request } from "express";
import { CLE_ROLES } from "../decorators/roles.decorator";
import type { UtilisateurAuthentifie } from "../types/utilisateur-authentifie";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexte: ExecutionContext): boolean {
    const rolesAttendus = this.reflector.getAllAndOverride<Role[] | undefined>(CLE_ROLES, [
      contexte.getHandler(),
      contexte.getClass(),
    ]);

    // Aucune contrainte de rôle déclarée : le garde ne fait rien. C'est JwtAuthGuard qui a déjà
    // vérifié que quelqu'un est bien connecté.
    if (!rolesAttendus?.length) return true;

    const requete = contexte.switchToHttp().getRequest<Request & { user?: UtilisateurAuthentifie }>();
    const utilisateur = requete.user;

    if (!utilisateur || !rolesAttendus.includes(utilisateur.role)) {
      throw new ForbiddenException("Accès réservé aux administrateurs.");
    }

    return true;
  }
}
