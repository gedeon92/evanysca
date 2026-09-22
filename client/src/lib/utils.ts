import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...entrees: ClassValue[]): string {
  return twMerge(clsx(entrees));
}

// Contrat unique du projet : le suffixe est inclus. formatFcfa(165000) === "165 000 FCFA".
// Les espaces insécables introduits par toLocaleString sont remplacés par des espaces ordinaires,
// sans quoi ils partiraient tels quels dans le message WhatsApp et s'y afficheraient mal.
export function formatFcfa(montant: number): string {
  return `${Math.round(montant).toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`;
}

export function formatDate(valeur: string | Date): string {
  return new Date(valeur).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export const SEUIL_DERNIERES_PIECES = 3;

// Le stock n'est jamais affiché en chiffres côté client. Sans modèle de commande, rien ne le
// décrémente automatiquement : annoncer « 2 en stock » serait une promesse qu'on ne tient pas.
export function libelleStock(stock: number): string | null {
  if (stock <= 0) return "Épuisé";
  if (stock <= SEUIL_DERNIERES_PIECES) return stock === 1 ? "Dernière pièce" : "Dernières pièces";
  return null;
}

// Une quantité vient toujours d'une saisie ou du localStorage : deux sources non fiables.
export function plafonnerQuantite(quantite: number, stock: number): number {
  if (!Number.isFinite(quantite)) return 1;
  const entier = Math.floor(quantite);
  if (entier < 1) return 1;
  if (stock > 0 && entier > stock) return stock;
  return entier;
}
