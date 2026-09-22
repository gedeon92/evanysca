import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";

type CorpsErreur = {
  statusCode: number;
  message: string;
  errors?: { fieldErrors: Record<string, string[]>; formErrors: string[] };
  path: string;
  timestamp: string;
};

// Noms de colonnes tels que Prisma les renvoie → message lisible par la vendeuse.
const LIBELLES_UNICITE: Record<string, string> = {
  email: "Cette adresse e-mail est déjà utilisée.",
  slug: "Ce lien (slug) est déjà utilisé par un autre élément.",
  ref: "Cette référence produit est déjà utilisée.",
  sku: "Ce SKU est déjà utilisé par une autre variante.",
  name: "Ce nom est déjà utilisé.",
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const contexte = host.switchToHttp();
    const response = contexte.getResponse<Response>();
    const request = contexte.getRequest<Request>();

    const corps = this.construireCorps(exception, request.url);

    if (corps.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url}`, exception as Error);
    }

    response.status(corps.statusCode).json(corps);
  }

  private construireCorps(exception: unknown, chemin: string): CorpsErreur {
    const base = { path: chemin, timestamp: new Date().toISOString() };

    if (exception instanceof HttpException) {
      const reponse = exception.getResponse();
      const detail = typeof reponse === "object" && reponse !== null ? (reponse as Record<string, unknown>) : {};

      return {
        ...base,
        statusCode: exception.getStatus(),
        message:
          typeof reponse === "string"
            ? reponse
            : (detail.message as string) ?? exception.message,
        errors: detail.errors as CorpsErreur["errors"],
      };
    }

    // Les erreurs Prisma remontent sinon en 500 opaque : `ref` et `sku` sont saisis à la main
    // dans le formulaire produit, la collision d'unicité est un cas courant, pas un incident.
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        const colonnes = this.colonnesVisees(exception);
        const fieldErrors = Object.fromEntries(
          colonnes.map((colonne) => [
            colonne,
            [LIBELLES_UNICITE[colonne] ?? "Cette valeur est déjà utilisée."],
          ]),
        );

        return {
          ...base,
          statusCode: HttpStatus.CONFLICT,
          message: colonnes.length
            ? Object.values(fieldErrors)[0][0]
            : "Cette valeur est déjà utilisée.",
          errors: { fieldErrors, formErrors: [] },
        };
      }

      if (exception.code === "P2025") {
        return { ...base, statusCode: HttpStatus.NOT_FOUND, message: "Élément introuvable." };
      }

      if (exception.code === "P2003") {
        return {
          ...base,
          statusCode: HttpStatus.CONFLICT,
          message: "Suppression impossible : cet élément est encore utilisé ailleurs.",
        };
      }
    }

    return {
      ...base,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Une erreur inattendue est survenue.",
    };
  }

  private colonnesVisees(exception: Prisma.PrismaClientKnownRequestError): string[] {
    const cible = exception.meta?.target;
    if (Array.isArray(cible)) return cible.map(String);
    if (typeof cible === "string") return [cible];
    return [];
  }
}
