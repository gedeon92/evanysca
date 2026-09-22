import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Env } from "../../config/env.validation";
import type { UtilisateurAuthentifie } from "../../common/types/utilisateur-authentifie";

export type ContenuJeton = {
  sub: string;
  email: string;
  role: UtilisateurAuthentifie["role"];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configuration: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration.get("JWT_ACCESS_SECRET", { infer: true }),
    });
  }

  // Aucune requête en base ici : le jeton d'accès ne vit que 15 minutes, le relire à chaque
  // requête coûterait un aller-retour SQL sur toutes les routes protégées pour rien.
  validate(contenu: ContenuJeton): UtilisateurAuthentifie {
    return { id: contenu.sub, email: contenu.email, role: contenu.role };
  }
}
