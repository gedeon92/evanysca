import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { calculerExpiration, genererJetonRafraichissement, hacherJeton } from "../../common/security/tokens";
import type { UtilisateurAuthentifie } from "../../common/types/utilisateur-authentifie";
import type { Env } from "../../config/env.validation";
import { PrismaService } from "../../prisma/prisma.service";
import type { ContenuJeton } from "./jwt.strategy";

// Un seul et même message pour « adresse inconnue » et « mot de passe faux » : sinon la page de
// connexion devient un moyen de découvrir quelles adresses possèdent un compte.
const IDENTIFIANTS_INVALIDES = "Adresse e-mail ou mot de passe incorrect.";

// Haché bidon comparé quand l'adresse n'existe pas, pour que la réponse prenne le même temps que
// dans le cas d'un mot de passe faux. Sans ça, le temps de réponse trahit l'existence du compte.
const HACHE_LEURRE = "$2b$12$abcdefghijklmnopqrstuuKq5xGmY2kHhKfPTcVqTx1zXn6b9r5.G";

export type ProfilPublic = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UtilisateurAuthentifie["role"];
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configuration: ConfigService<Env, true>,
  ) {}

  async connecter(email: string, motDePasse: string) {
    const utilisateur = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!utilisateur) {
      await bcrypt.compare(motDePasse, HACHE_LEURRE);
      throw new UnauthorizedException(IDENTIFIANTS_INVALIDES);
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.passwordHash);
    if (!motDePasseValide) throw new UnauthorizedException(IDENTIFIANTS_INVALIDES);

    const jetonAcces = this.signerJetonAcces(utilisateur);
    const jetonRafraichissement = await this.creerJetonRafraichissement(utilisateur.id);

    return {
      accessToken: jetonAcces,
      refreshToken: jetonRafraichissement,
      utilisateur: this.profilPublic(utilisateur),
    };
  }

  async rafraichir(jetonRecu: string) {
    const enregistrement = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hacherJeton(jetonRecu) },
      include: { user: true },
    });

    if (!enregistrement) throw new UnauthorizedException("Session expirée, reconnecte-toi.");

    // Jeton déjà révoqué mais présenté à nouveau : soit il a été volé, soit il a fuité. On ne sait
    // pas lequel des deux appareils est légitime, donc on coupe toutes les sessions de ce compte.
    if (enregistrement.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: enregistrement.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      this.logger.warn(`Jeton de rafraîchissement rejoué pour ${enregistrement.user.email} : toutes les sessions ont été révoquées.`);
      throw new UnauthorizedException("Session invalide, reconnecte-toi.");
    }

    if (enregistrement.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("Session expirée, reconnecte-toi.");
    }

    // Rotation : l'ancien jeton meurt à chaque rafraîchissement. Un jeton intercepté n'est donc
    // utilisable qu'une seule fois, et son usage déclenche la détection ci-dessus.
    await this.prisma.refreshToken.update({
      where: { id: enregistrement.id },
      data: { revokedAt: new Date() },
    });

    return {
      accessToken: this.signerJetonAcces(enregistrement.user),
      refreshToken: await this.creerJetonRafraichissement(enregistrement.userId),
      utilisateur: this.profilPublic(enregistrement.user),
    };
  }

  async deconnecter(jetonRecu: string | undefined): Promise<void> {
    if (!jetonRecu) return;

    // updateMany plutôt que update : se déconnecter avec un jeton déjà inconnu ne doit pas lever
    // d'erreur, l'intention de l'utilisateur est satisfaite dans tous les cas.
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hacherJeton(jetonRecu), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async profil(utilisateurId: string): Promise<ProfilPublic> {
    const utilisateur = await this.prisma.user.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) throw new UnauthorizedException("Compte introuvable.");
    return this.profilPublic(utilisateur);
  }

  private signerJetonAcces(utilisateur: { id: string; email: string; role: UtilisateurAuthentifie["role"] }): string {
    const contenu: ContenuJeton = { sub: utilisateur.id, email: utilisateur.email, role: utilisateur.role };

    return this.jwt.sign(contenu, {
      secret: this.configuration.get("JWT_ACCESS_SECRET", { infer: true }),
      expiresIn: this.configuration.get("JWT_ACCESS_TTL", { infer: true }),
    });
  }

  private async creerJetonRafraichissement(utilisateurId: string): Promise<string> {
    const jeton = genererJetonRafraichissement();

    await this.prisma.refreshToken.create({
      data: {
        userId: utilisateurId,
        tokenHash: hacherJeton(jeton),
        expiresAt: calculerExpiration(this.configuration.get("JWT_REFRESH_TTL", { infer: true })),
      },
    });

    return jeton;
  }

  private profilPublic(utilisateur: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: UtilisateurAuthentifie["role"];
  }): ProfilPublic {
    const { id, email, firstName, lastName, phone, role } = utilisateur;
    return { id, email, firstName, lastName, phone, role };
  }
}
