// Point unique de vérité pour tout ce qui appartient à la marque. Rien de tout cela n'est écrit
// en dur ailleurs dans le code : le jour où la cliente communique ses informations définitives,
// c'est ce fichier — et le .env — qui changent, pas les composants.

function lire(valeur: string | undefined, defaut: string): string {
  const nettoyee = valeur?.trim();
  return nettoyee ? nettoyee : defaut;
}

export const BOUTIQUE = {
  nom: lire(import.meta.env.VITE_BRAND_NAME, "Maison Séraphine"),
  baseline: lire(
    import.meta.env.VITE_BRAND_TAGLINE,
    "Pièces façonnées à la main, en série très limitée",
  ),
  ville: lire(import.meta.env.VITE_BRAND_CITY, "Dakar"),
  email: lire(import.meta.env.VITE_BRAND_EMAIL, ""),
  instagram: lire(import.meta.env.VITE_BRAND_INSTAGRAM, ""),

  // Format international sans « + » ni espaces : c'est ce qu'attend wa.me. Un numéro mal formaté
  // ouvre WhatsApp sur une conversation vide, sans erreur visible — d'où le contrôle ci-dessous.
  numeroWhatsApp: lire(import.meta.env.VITE_WHATSAPP_NUMBER, "221770000000"),
} as const;

export function numeroWhatsAppValide(numero: string = BOUTIQUE.numeroWhatsApp): boolean {
  return /^[1-9]\d{7,14}$/.test(numero);
}

// Affichage lisible : 221770000000 devient « +221 77 000 00 00 ».
export function numeroWhatsAppAffiche(numero: string = BOUTIQUE.numeroWhatsApp): string {
  if (!numeroWhatsAppValide(numero)) return numero;
  const indicatif = numero.slice(0, 3);
  const reste = numero.slice(3);
  const groupes = reste.match(/\d{2,3}/g) ?? [reste];
  return `+${indicatif} ${groupes.join(" ")}`;
}
