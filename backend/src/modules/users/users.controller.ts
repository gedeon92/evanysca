import { Body, Controller, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { MiseAJourProfilDto, schemaMiseAJourProfil } from "./dto/update-me.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch("me")
  async mettreAJour(
    @CurrentUser("id") utilisateurId: string,
    @Body(new ZodValidationPipe(schemaMiseAJourProfil)) corps: MiseAJourProfilDto,
  ) {
    return this.users.mettreAJourProfil(utilisateurId, corps);
  }
}
