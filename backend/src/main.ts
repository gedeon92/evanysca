import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // L'API tourne derrière le proxy de Render : sans cette option, Express voit l'adresse du proxy
  // pour toutes les requêtes et le rate limiting s'applique globalement au lieu d'être par client.
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  app.use(helmet());
  app.use(cookieParser());

  // Le domaine nu et le www comptent comme deux origines distinctes : toutes doivent être listées.
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? "").split(",").map((origine) => origine.trim()),
    credentials: true,
  });

  app.setGlobalPrefix("api");
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);

  new Logger("Bootstrap").log(`API démarrée sur http://localhost:${port}/api`);
}

void bootstrap();
