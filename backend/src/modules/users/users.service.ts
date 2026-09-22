import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import type { MiseAJourProfilDto } from "./dto/update-me.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async mettreAJourProfil(utilisateurId: string, modifications: MiseAJourProfilDto) {
    const utilisateur = await this.prisma.user.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) throw new NotFoundException("Compte introuvable.");

    const { email, firstName, lastName, phone, currentPassword, newPassword } = modifications;

    let nouveauHash: string | undefined;

    if (newPassword) {
      const motDePasseValide = await bcrypt.compare(currentPassword ?? "", utilisateur.passwordHash);
      if (!motDePasseValide) {
        throw new BadRequestException({
          message: "Le mot de passe actuel est incorrect.",
          errors: { fieldErrors: { currentPassword: ["Le mot de passe actuel est incorrect."] }, formErrors: [] },
        });
      }
      nouveauHash = await bcrypt.hash(newPassword, 12);
    }

    const misAJour = await this.prisma.user.update({
      where: { id: utilisateurId },
      data: {
        ...(email !== undefined ? { email: email.toLowerCase() } : {}),
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(nouveauHash ? { passwordHash: nouveauHash } : {}),
      },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
    });

    // Changer de mot de passe doit fermer les sessions ouvertes ailleurs — c'est précisément le
    // geste qu'on fait quand on soupçonne un accès indésirable.
    if (nouveauHash) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: utilisateurId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return { user: misAJour, sessionsRevoquees: Boolean(nouveauHash) };
  }
}
