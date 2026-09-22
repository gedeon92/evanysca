import { apiUpload } from "../lib/api";

export type ImageTeleversee = { url: string; publicId: string };

export function televerserImage(fichier: File): Promise<ImageTeleversee> {
  return apiUpload<ImageTeleversee>("/admin/uploads", fichier);
}
