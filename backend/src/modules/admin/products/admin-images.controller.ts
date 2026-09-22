import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, UseGuards } from "@nestjs/common";
import { Roles } from "../../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { AdminProductsService } from "./admin-products.service";
import { PositionImageDto, schemaPositionImage } from "./dto/variant.dto";

@Controller("admin/images")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminImagesController {
  constructor(private readonly produits: AdminProductsService) {}

  @Patch(":id")
  async deplacer(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(schemaPositionImage)) corps: PositionImageDto,
  ) {
    return this.produits.deplacerImage(id, corps.position);
  }

  @Delete(":id")
  async supprimer(@Param("id", ParseUUIDPipe) id: string) {
    return this.produits.supprimerImage(id);
  }
}
