import { Module } from "@nestjs/common";
import { AdminImagesController } from "./admin-images.controller";
import { AdminProductsController } from "./admin-products.controller";
import { AdminProductsService } from "./admin-products.service";
import { AdminVariantsController } from "./admin-variants.controller";

@Module({
  controllers: [AdminProductsController, AdminVariantsController, AdminImagesController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
