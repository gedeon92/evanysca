import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { AdminProductsService } from "./admin-products.service";
import {
  CreationProduitDto,
  ListeProduitsAdminDto,
  MiseAJourProduitDto,
  schemaCreationProduit,
  schemaListeProduitsAdmin,
  schemaMiseAJourProduit,
} from "./dto/product.dto";
import { CreationVarianteDto, schemaCreationVariante } from "./dto/variant.dto";

@Controller("admin/products")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminProductsController {
  constructor(private readonly produits: AdminProductsService) {}

  @Get()
  async lister(@Query(new ZodValidationPipe(schemaListeProduitsAdmin)) filtres: ListeProduitsAdminDto) {
    return this.produits.lister(filtres);
  }

  @Get(":id")
  async parId(@Param("id", ParseUUIDPipe) id: string) {
    return this.produits.parId(id);
  }

  @Post()
  async creer(@Body(new ZodValidationPipe(schemaCreationProduit)) corps: CreationProduitDto) {
    return this.produits.creer(corps);
  }

  @Patch(":id")
  async mettreAJour(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(schemaMiseAJourProduit)) corps: MiseAJourProduitDto,
  ) {
    return this.produits.mettreAJour(id, corps);
  }

  @Delete(":id")
  async supprimer(@Param("id", ParseUUIDPipe) id: string) {
    return this.produits.supprimer(id);
  }

  @Post(":id/variants")
  async ajouterVariante(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(schemaCreationVariante)) corps: CreationVarianteDto,
  ) {
    return this.produits.ajouterVariante(id, corps);
  }
}
