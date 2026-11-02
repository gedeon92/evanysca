import { BOUTIQUE } from "./boutique";
import { formatFcfa } from "./utils";

const MARQUE = BOUTIQUE.nom.toUpperCase();

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

// Référence courte pour que la vendeuse et la cliente parlent de la même commande. Elle dépend du
// contenu du panier et du jour : le lien reste identique d'un rendu à l'autre, sans rien stocker.
export function referenceCommande(lignes: LignePanier[], jour: Date = new Date()): string {
  const graine = `${jour.toISOString().slice(0, 10)}|${lignes.map((ligne) => `${ligne.variantId}x${ligne.qty}`).join(",")}`;
  let empreinte = 5381;
  for (const caractere of graine) empreinte = ((empreinte * 33) ^ caractere.charCodeAt(0)) >>> 0;
  return `EVA-${empreinte.toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;
}

// Le gras (*…*) et l'italique (_…_) sont ceux de WhatsApp : le message arrive mis en forme.
function ligneLisible(ligne: LignePanier, index: number): string {
  return `${index + 1}. *${ligne.name}* — ${ligne.color}\n    ${ligne.qty} × ${formatFcfa(ligne.price)} = ${formatFcfa(
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
  site = "",
): string {
  const corps = lignes
    .map((ligne, index) => (format === "lisible" ? ligneLisible(ligne, index) : ligneCompacte(ligne)))
    .join(format === "lisible" ? "\n\n" : "\n");

  const identite = [
    coordonnees.nom?.trim() ? `Nom : ${coordonnees.nom.trim()}` : null,
    coordonnees.ville?.trim() ? `Ville / quartier : ${coordonnees.ville.trim()}` : null,
    coordonnees.telephone?.trim() ? `Téléphone : ${coordonnees.telephone.trim()}` : null,
    coordonnees.note?.trim() ? `Note : ${coordonnees.note.trim()}` : null,
  ].filter((entree): entree is string => entree !== null);

  // Le formulaire est facultatif : sans coordonnées, on n'ajoute pas de lignes vides que la
  // vendeuse devrait relire pour rien.
  const bloc = identite.length ? `\n\n*Mes coordonnées*\n${identite.join("\n")}` : "";
  const quantite = nombreArticles(lignes);

  // Le lien du site en dernière ligne : WhatsApp en tire l'aperçu avec le logo de la boutique.
  return (
    `*NOUVELLE COMMANDE — ${MARQUE}*\n` +
    `_Commande passée sur notre site web_\n` +
    `Réf. ${referenceCommande(lignes)}\n\n` +
    `Bonjour, je souhaite commander :\n\n${corps}\n\n` +
    `━━━━━━━━━━━━\n` +
    `*Total : ${formatFcfa(sousTotal(lignes))}* (${quantite} article${quantite > 1 ? "s" : ""})${bloc}\n\n` +
    `Merci de me confirmer la disponibilité et la livraison.` +
    (site ? `\n\n${site}` : "")
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
  site = "",
): CommandeWhatsApp {
  const lisible = construireMessage(lignes, coordonnees, "lisible", site);
  const hrefLisible = lienWhatsApp(lisible, numero);

  if (hrefLisible.length <= LIMITE_URL) {
    return { href: hrefLisible, message: lisible, format: "lisible", longueurUrl: hrefLisible.length };
  }

  const compact = construireMessage(lignes, coordonnees, "compact", site);
  const hrefCompact = lienWhatsApp(compact, numero);

  return { href: hrefCompact, message: compact, format: "compact", longueurUrl: hrefCompact.length };
}

// Bouton « Commander cet article » de la fiche produit : une seule ligne, pas de coordonnées. Le
// lien de la fiche permet à la vendeuse de voir aussitôt de quelle pièce il s'agit.
export function lienArticleUnique(
  article: { name: string; color: string; price: number; slug?: string },
  numero: string,
  site = "",
): string {
  const message =
    `*DEMANDE — ${MARQUE}*\n` +
    `_Envoyée depuis notre site web_\n\n` +
    `Bonjour, je suis intéressé(e) par cet article :\n\n` +
    `*${article.name}* — ${article.color}\n` +
    `Prix : ${formatFcfa(article.price)}\n\n` +
    `Est-il disponible ?` +
    (site ? `\n\n${site}${article.slug ? `/produit/${article.slug}` : ""}` : "");

  return lienWhatsApp(message, numero);
}
