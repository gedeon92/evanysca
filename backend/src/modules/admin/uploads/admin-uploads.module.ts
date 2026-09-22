import { Module } from "@nestjs/common";
import { AdminUploadsController } from "./admin-uploads.controller";

@Module({
  controllers: [AdminUploadsController],
})
export class AdminUploadsModule {}
