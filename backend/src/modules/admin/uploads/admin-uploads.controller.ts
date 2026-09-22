import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService, PREFIXE_CLOUDINARY } from "../../../common/cloudinary/cloudinary.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";

const TAILLE_MAX = 5 * 1024 * 1024;
const TYPES_AUTORISES = ["image/jpeg", "image/png", "image/webp"];

@Controller("admin/uploads")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminUploadsController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: TAILLE_MAX, files: 1 },
      fileFilter: (_requete, fichier, callback) => {
        if (!TYPES_AUTORISES.includes(fichier.mimetype)) {
          return callback(new BadRequestException("Format accepté : JPEG, PNG ou WebP."), false);
        }
        callback(null, true);
      },
    }),
  )
  async televerser(@UploadedFile() fichier?: { buffer: Buffer; originalname: string; size: number }) {
    if (!fichier) throw new BadRequestException("Aucun fichier reçu (champ attendu : « file »).");
    return this.cloudinary.televerser(fichier);
  }

  // Paramètre wildcard : le publicId contient le préfixe, donc un « / », qu'un :publicId simple
  // couperait — la route ne serait jamais atteinte.
  @Delete(":publicId(*)")
  async supprimer(@Param("publicId") publicId: string) {
    if (!publicId.startsWith(`${PREFIXE_CLOUDINARY}/`)) {
      throw new BadRequestException("Cet identifiant n'appartient pas à la boutique.");
    }

    await this.cloudinary.supprimer(publicId);
    return { message: "Image supprimée." };
  }
}
