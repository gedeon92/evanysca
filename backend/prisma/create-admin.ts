import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Aucun e-mail n'est envoyé dans tout le projet : la création d'un compte administrateur passe
// donc par ce script, exécuté par le développeur sur la machine ou depuis le shell de Render.
// Usage : npm run admin:create -- <email> <motDePasse> [prénom] [nom]
async function main(): Promise<void> {
  const [email, motDePasse, prenom = "Admin", nom = "Boutique"] = process.argv.slice(2);

  if (!email || !motDePasse) {
    console.error('Usage : npm run admin:create -- <email> <motDePasse> [prénom] [nom]');
    process.exit(1);
  }

  if (motDePasse.length < 10) {
    console.error("Mot de passe trop court : 10 caractères minimum.");
    process.exit(1);
  }

  const existant = await prisma.user.findUnique({ where: { email } });
  if (existant) {
    console.error(`Un compte existe déjà pour ${email}. Pour changer son mot de passe : npm run admin:reset-password -- ${email} <nouveauMotDePasse>`);
    process.exit(1);
  }

  const utilisateur = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(motDePasse, 12),
      firstName: prenom,
      lastName: nom,
      role: "ADMIN",
    },
  });

  console.log(`Compte administrateur créé : ${utilisateur.email}`);
}

main()
  .catch((erreur) => {
    console.error("Création interrompue :", erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
