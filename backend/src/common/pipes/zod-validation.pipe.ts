import { BadRequestException, PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";

// Un seul pipe pour tous les DTO : `@UsePipes(new ZodValidationPipe(monSchema))`.
// Le format de réponse est celui que `ApiError` sait relire champ par champ côté front.
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(valeur: unknown): unknown {
    const resultat = this.schema.safeParse(valeur);

    if (!resultat.success) {
      throw new BadRequestException({
        message: "Certains champs sont invalides.",
        errors: resultat.error.flatten(),
      });
    }

    return resultat.data;
  }
}
