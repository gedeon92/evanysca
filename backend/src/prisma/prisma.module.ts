import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// Global : chaque module métier injecte PrismaService sans avoir à réimporter PrismaModule.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
