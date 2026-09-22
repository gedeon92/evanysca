import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Remplace le « mot de passe oublié » par e-mail, absent du projet par choix.
// Usage : npm run admin:reset-password -- <email> <nouveauMotDePasse>
async function main(): Promise<void> {
  const [email, nouveauMotDePasse] = process.argv.slice(2);

  if (!email || !nouveauMotDePasse) {
    console.error("Usage : npm run admin:reset-password -- <email> <nouveauMotDePasse>");
    process.exit(1);
  }

  if (nouveauMotDePasse.length < 10) {
    console.error("Mot de passe trop court : 10 caractères minimum.");
    process.exit(1);
  }

  const utilisateur = await prisma.user.findUnique({ where: { email } });
  if (!utilisateur) {
    console.error(`Aucun compte pour ${email}.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(nouveauMotDePasse, 12) },
  });

  // Un mot de passe est réinitialisé parce qu'on le croit compromis : laisser les sessions
  // ouvertes sur les appareils déjà connectés viderait la manœuvre de son sens.
  const { count } = await prisma.refreshToken.updateMany({
    where: { userId: utilisateur.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  console.log(`Mot de passe mis à jour pour ${email}. Sessions révoquées : ${count}.`);
}

main()
  .catch((erreur) => {
    console.error("Réinitialisation interrompue :", erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
