import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { CookieOptions, Request, Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { dureeEnMillisecondes } from "../../common/security/tokens";
import type { Env } from "../../config/env.validation";
import { AuthService } from "./auth.service";
import { ConnexionAdminDto, schemaConnexionAdmin } from "./dto/admin-login.dto";

export const COOKIE_RAFRAICHISSEMENT = "refresh_token";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly configuration: ConfigService<Env, true>,
  ) {}

  // 5 tentatives par minute : le garde global à 120 laisserait tout le loisir de deviner un mot
  // de passe, et c'est la seule porte d'entrée du projet.
  @Post("admin-login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UsePipes(new ZodValidationPipe(schemaConnexionAdmin))
  async connexion(@Body() corps: ConnexionAdminDto, @Res({ passthrough: true }) reponse: Response) {
    const { accessToken, refreshToken, utilisateur } = await this.auth.connecter(
      corps.email,
      corps.password,
    );

    this.poserCookie(reponse, refreshToken);

    // Le jeton d'accès repart dans le corps, jamais dans un cookie : le front le garde en mémoire
    // JavaScript uniquement, ce qui le rend inaccessible à une éventuelle injection persistante.
    return { accessToken, user: utilisateur };
  }

  @Post("admin-refresh")
  @HttpCode(HttpStatus.OK)
  async rafraichissement(@Req() requete: Request, @Res({ passthrough: true }) reponse: Response) {
    const jeton = this.lireCookie(requete);
    if (!jeton) {
      // Cookie absent : on renvoie la même erreur qu'un jeton invalide, le front réagit pareil.
      this.effacerCookie(reponse);
      return this.auth.rafraichir("");
    }

    try {
      const { accessToken, refreshToken, utilisateur } = await this.auth.rafraichir(jeton);
      this.poserCookie(reponse, refreshToken);
      return { accessToken, user: utilisateur };
    } catch (erreur) {
      // Le cookie ne servira plus jamais : le laisser ferait retenter un rafraîchissement voué
      // à l'échec à chaque chargement de page.
      this.effacerCookie(reponse);
      throw erreur;
    }
  }

  @Post("admin-logout")
  @HttpCode(HttpStatus.OK)
  async deconnexion(@Req() requete: Request, @Res({ passthrough: true }) reponse: Response) {
    await this.auth.deconnecter(this.lireCookie(requete));
    this.effacerCookie(reponse);
    return { message: "Déconnexion effectuée." };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async moi(@CurrentUser("id") utilisateurId: string) {
    return { user: await this.auth.profil(utilisateurId) };
  }

  private lireCookie(requete: Request): string | undefined {
    return (requete.cookies as Record<string, string> | undefined)?.[COOKIE_RAFRAICHISSEMENT];
  }

  private poserCookie(reponse: Response, jeton: string): void {
    reponse.cookie(COOKIE_RAFRAICHISSEMENT, jeton, {
      ...this.optionsCookie(),
      maxAge: dureeEnMillisecondes(this.configuration.get("JWT_REFRESH_TTL", { infer: true })),
    });
  }

  private effacerCookie(reponse: Response): void {
    reponse.clearCookie(COOKIE_RAFRAICHISSEMENT, this.optionsCookie());
  }

  private optionsCookie(): CookieOptions {
    // En production le front (Vercel) et l'API (Render) sont deux sites distincts : sans
    // sameSite "none" le cookie ne serait tout simplement pas envoyé. Mais "none" impose
    // "secure", que http://localhost ne peut pas satisfaire — d'où la bascule.
    const production = this.configuration.get("NODE_ENV", { infer: true }) === "production";

    return {
      httpOnly: true,
      secure: production,
      sameSite: production ? "none" : "lax",
      // Le cookie n'est envoyé que sur les routes qui s'en servent, pas sur tout le catalogue.
      path: "/api/auth",
    };
  }
}
