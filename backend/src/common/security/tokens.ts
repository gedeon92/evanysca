import { createHash, randomBytes } from "crypto";

// Le jeton de rafraîchissement est une valeur aléatoire de 48 octets, pas un JWT : il n'a rien à
// transporter, il sert uniquement de clé de recherche en base.
export function genererJetonRafraichissement(): string {
  return randomBytes(48).toString("base64url");
}

// SHA-256 et non bcrypt, contrairement aux mots de passe : le jeton a déjà 384 bits d'entropie,
// rien à ralentir contre une attaque par dictionnaire. Surtout, un hachage déterministe permet de
// retrouver la ligne par index unique ; avec bcrypt il faudrait comparer chaque jeton de la table.
export function hacherJeton(jeton: string): string {
  return createHash("sha256").update(jeton).digest("hex");
}

const UNITES: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

// Accepte le format des TTL de JWT ("15m", "30d") pour n'avoir qu'une seule écriture de durée
// dans le .env, partagée par le jeton d'accès et le cookie de rafraîchissement.
export function dureeEnMillisecondes(ttl: string): number {
  const correspondance = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!correspondance) {
    throw new Error(`Durée invalide : « ${ttl} ». Format attendu : 15m, 24h, 30d…`);
  }
  return Number(correspondance[1]) * UNITES[correspondance[2]];
}

export function calculerExpiration(ttl: string, depuis: Date = new Date()): Date {
  return new Date(depuis.getTime() + dureeEnMillisecondes(ttl));
}
