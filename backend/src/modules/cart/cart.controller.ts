import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CartService } from "./cart.service";
import { ValidationPanierDto, schemaValidationPanier } from "./dto/validate-cart.dto";

@Controller("cart")
export class CartController {
  constructor(private readonly cart: CartService) {}

  // POST et non GET : la liste des variantes peut être longue, et une URL de plusieurs centaines
  // de caractères finirait tronquée par un intermédiaire.
  @Post("validate")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(schemaValidationPanier))
  async valider(@Body() corps: ValidationPanierDto) {
    return this.cart.valider(corps.variantIds);
  }
}
