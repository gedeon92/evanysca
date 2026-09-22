import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async verifier() {
    const baseDisponible = await this.prisma.verifierConnexion();

    return {
      status: baseDisponible ? "ok" : "degraded",
      database: baseDisponible ? "up" : "down",
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
