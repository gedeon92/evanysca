import { formatFcfa } from "./utils";

export type LignePanier = {
  variantId: string;
  name: string;
  color: string;
  price: number;
  qty: number;
};

export type CoordonneesClient = {
  nom?: string;
  ville?: string;
  telephone?: string;
  note?: string;
};

// 1 800 caractères d'URL encodée. La limite pratique d'une URL tourne autour de 2 000 caractères
// selon les navigateurs et WhatsApp tronque sans prévenir : on garde une marge.
export const LIMITE_URL = 1800;

export type FormatMessage = "lisible" | "compact";

export function sousTotal(lignes: LignePanier[]): number {
  return lignes.reduce((total, ligne) => total + ligne.price * ligne.qty, 0);
}

export function nombreArticles(lignes: LignePanier[]): number {
  return lignes.reduce((total, ligne) => total + ligne.qty, 0);
}

// Format aéré, celui qu'on veut par défaut : la vendeuse lit la commande d'un coup d'œil.
function ligneLisible(ligne: LignePanier, index: number): string {
  return `${index + 1}. ${ligne.name} — ${ligne.color}\n   Quantité : ${ligne.qty} — ${formatFcfa(
    ligne.price * ligne.qty,
  )}`;
}

// Format de repli, deux fois plus court. Chaque accent et chaque retour à la ligne triplent de
// taille une fois encodés dans l'URL : un panier d'une dizaine de lignes dépasse vite la limite.
function ligneCompacte(ligne: LignePanier): string {
  return `${ligne.qty}× ${ligne.name} / ${ligne.color} — ${formatFcfa(ligne.price * ligne.qty)}`;
}

export function construireMessage(
  lignes: LignePanier[],
  coordonnees: CoordonneesClient = {},
  format: FormatMessage = "lisible",
): string {
  const corps = lignes
    .map((ligne, index) => (format === "lisible" ? ligneLisible(ligne, index) : ligneCompacte(ligne)))
    .join("\n");

  const identite = [
    coordonnees.nom?.trim() ? `Nom : ${coordonnees.nom.trim()}` : null,
    coordonnees.ville?.trim() ? `Ville / quartier : ${coordonnees.ville.trim()}` : null,
    coordonnees.telephone?.trim() ? `Téléphone : ${coordonnees.telephone.trim()}` : null,
    coordonnees.note?.trim() ? `Note : ${coordonnees.note.trim()}` : null,
  ].filter((entree): entree is string => entree !== null);

  // Le formulaire est facultatif : sans coordonnées, on n'ajoute pas de lignes vides que la
  // vendeuse devrait relire pour rien.
  const bloc = identite.length ? `\n\n${identite.join("\n")}` : "";

  return (
    `Bonjour, je souhaite passer commande :\n\n${corps}\n\n` +
    `Total : ${formatFcfa(sousTotal(lignes))}${bloc}`
  );
}

export function lienWhatsApp(message: string, numero: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}

export type CommandeWhatsApp = {
  href: string;
  message: string;
  format: FormatMessage;
  longueurUrl: number;
};

// Construit le lien final : format lisible tant qu'il tient dans l'URL, format compact sinon.
export function lienCommande(
  lignes: LignePanier[],
  coordonnees: CoordonneesClient,
  numero: string,
): CommandeWhatsApp {
  const lisible = construireMessage(lignes, coordonnees, "lisible");
  const hrefLisible = lienWhatsApp(lisible, numero);

  if (hrefLisible.length <= LIMITE_URL) {
    return { href: hrefLisible, message: lisible, format: "lisible", longueurUrl: hrefLisible.length };
  }

  const compact = construireMessage(lignes, coordonnees, "compact");
  const hrefCompact = lienWhatsApp(compact, numero);

  return { href: hrefCompact, message: compact, format: "compact", longueurUrl: hrefCompact.length };
}

// Bouton « Commander cet article » de la fiche produit : une seule ligne, pas de coordonnées.
export function lienArticleUnique(
  article: { name: string; color: string; price: number },
  numero: string,
): string {
  const message =
    `Bonjour, je suis intéressée par cet article :\n\n` +
    `${article.name} — ${article.color}\n` +
    `Prix : ${formatFcfa(article.price)}\n\n` +
    `Est-il disponible ?`;

  return lienWhatsApp(message, numero);
}
