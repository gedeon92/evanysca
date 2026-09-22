import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UsePipes } from "@nestjs/common";
import { Roles } from "../../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { AdminCategoriesService } from "./admin-categories.service";
import {
  CreationCategorieDto,
  MiseAJourCategorieDto,
  schemaCreationCategorie,
  schemaMiseAJourCategorie,
} from "./dto/category.dto";

@Controller("admin/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminCategoriesController {
  constructor(private readonly categories: AdminCategoriesService) {}

  @Get()
  async lister() {
    return this.categories.lister();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(schemaCreationCategorie))
  async creer(@Body() corps: CreationCategorieDto) {
    return this.categories.creer(corps);
  }

  @Patch(":id")
  async mettreAJour(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(schemaMiseAJourCategorie)) corps: MiseAJourCategorieDto,
  ) {
    return this.categories.mettreAJour(id, corps);
  }

  @Delete(":id")
  async supprimer(@Param("id", ParseUUIDPipe) id: string) {
    return this.categories.supprimer(id);
  }
}
