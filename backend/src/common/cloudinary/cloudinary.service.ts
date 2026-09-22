import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { randomUUID } from "crypto";
import type { Env } from "../../config/env.validation";

// Tout ce que le projet envoie chez Cloudinary porte ce préfixe. C'est lui qui garantit qu'une
// suppression ne peut pas viser un fichier appartenant à un autre projet du même compte.
export const PREFIXE_CLOUDINARY = "boutique-whatsapp";

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly configure: boolean;

  constructor(configuration: ConfigService<Env, true>) {
    const cloudName = configuration.get("CLOUDINARY_CLOUD_NAME", { infer: true });
    const apiKey = configuration.get("CLOUDINARY_API_KEY", { infer: true });
    const apiSecret = configuration.get("CLOUDINARY_API_SECRET", { infer: true });

    this.configure = Boolean(cloudName && apiKey && apiSecret);

    if (this.configure) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    } else {
      // Volontairement non bloquant : l'API doit démarrer sans Cloudinary, seul l'envoi d'images
      // échoue — avec un message explicite plutôt qu'une erreur incompréhensible.
      this.logger.warn("Cloudinary n'est pas configuré : l'envoi d'images est désactivé.");
    }
  }

  get estConfigure(): boolean {
    return this.configure;
  }

  async televerser(fichier: { buffer: Buffer; originalname: string }): Promise<{ url: string; publicId: string }> {
    if (!this.configure) {
      throw new ServiceUnavailableException(
        "L'envoi d'images est indisponible : les variables CLOUDINARY_* ne sont pas renseignées sur le serveur.",
      );
    }

    // Identifiant tiré au sort et non dérivé du nom de fichier : deux photos nommées « IMG_1234 »
    // s'écraseraient l'une l'autre, et un nom d'origine peut contenir n'importe quoi.
    const publicId = `${PREFIXE_CLOUDINARY}/${randomUUID()}`;

    const reponse = await new Promise<UploadApiResponse>((resoudre, rejeter) => {
      const flux = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: "image", overwrite: false },
        (erreur, resultat) => {
          if (erreur || !resultat) return rejeter(erreur ?? new Error("Envoi Cloudinary sans réponse."));
          resoudre(resultat);
        },
      );
      flux.end(fichier.buffer);
    });

    return { url: reponse.secure_url, publicId: reponse.public_id };
  }

  async supprimer(publicId: string): Promise<void> {
    if (!this.configure) return;

    if (!publicId.startsWith(`${PREFIXE_CLOUDINARY}/`)) {
      throw new ServiceUnavailableException("Identifiant d'image hors du périmètre de la boutique.");
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }

  // Suppression « au mieux » : quand une image disparaît de la base, son fichier distant n'a plus
  // de raison d'exister, mais un échec côté Cloudinary ne doit pas empêcher la suppression métier.
  async supprimerSansEchouer(publicId: string | null | undefined): Promise<void> {
    if (!publicId) return;

    try {
      await this.supprimer(publicId);
    } catch (erreur) {
      this.logger.warn(`Image Cloudinary non supprimée (${publicId}) : ${(erreur as Error).message}`);
    }
  }
}
