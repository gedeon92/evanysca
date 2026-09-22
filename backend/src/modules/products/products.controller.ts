import { Controller, Get, Param, Query } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { ListeProduitsDto, schemaListeProduits } from "./dto/list-products.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  async lister(@Query(new ZodValidationPipe(schemaListeProduits)) filtres: ListeProduitsDto) {
    return this.products.lister(filtres);
  }

  @Get(":slug")
  async parSlug(@Param("slug") slug: string) {
    return this.products.parSlug(slug);
  }
}
