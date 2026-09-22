import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connectee = false;

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.connectee = true;
    } catch (erreur) {
      // En production, une base injoignable est une panne : mieux vaut refuser de démarrer que
      // répondre 500 à chaque requête. En développement on laisse l'API monter, pour pouvoir
      // travailler sur les fronts sans PostgreSQL installé.
      if (process.env.NODE_ENV === "production") throw erreur;

      this.logger.warn(`Base de données injoignable : ${(erreur as Error).message}`);
      this.logger.warn("L'API démarre quand même (développement) — GET /api/health signalera « down ».");
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  // Vérifie réellement la connexion plutôt que de se fier au résultat du démarrage : la base peut
  // être tombée — ou remontée — depuis.
  async verifierConnexion(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      this.connectee = true;
    } catch {
      this.connectee = false;
    }
    return this.connectee;
  }
}
