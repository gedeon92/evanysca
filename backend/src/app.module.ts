import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { CloudinaryModule } from "./common/cloudinary/cloudinary.module";
import { validateEnv } from "./config/env.validation";
import { AdminCategoriesModule } from "./modules/admin/categories/admin-categories.module";
import { AdminDashboardModule } from "./modules/admin/dashboard/admin-dashboard.module";
import { AdminProductsModule } from "./modules/admin/products/admin-products.module";
import { AdminUploadsModule } from "./modules/admin/uploads/admin-uploads.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CartModule } from "./modules/cart/cart.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ProductsModule } from "./modules/products/products.module";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Garde-fou général. La route de connexion portera en plus son propre @Throttle, bien plus
    // serré : 120 requêtes/minute laisseraient tout le loisir de deviner un mot de passe.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    CloudinaryModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    UsersModule,
    AdminDashboardModule,
    AdminCategoriesModule,
    AdminProductsModule,
    AdminUploadsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
