import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { AdminProductsService } from "./admin-products.service";
import {
  AjoutImageDto,
  MiseAJourVarianteDto,
  schemaAjoutImage,
  schemaMiseAJourVariante,
} from "./dto/variant.dto";

// Les teintes vivent sous /api/admin/variants et non sous le produit : une fois créée, une
// variante se modifie par son propre identifiant, sans avoir à rappeler celui du produit.
@Controller("admin/variants")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminVariantsController {
  constructor(private readonly produits: AdminProductsService) {}

  @Patch(":id")
  async mettreAJour(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(schemaMiseAJourVariante)) corps: MiseAJourVarianteDto,
  ) {
    return this.produits.mettreAJourVariante(id, corps);
  }

  @Delete(":id")
  async supprimer(@Param("id", ParseUUIDPipe) id: string) {
    return this.produits.supprimerVariante(id);
  }

  @Post(":id/images")
  async ajouterImage(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(schemaAjoutImage)) corps: AjoutImageDto,
  ) {
    return this.produits.ajouterImage(id, corps);
  }
}
