import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx assemble les classes conditionnelles, tailwind-merge tranche les conflits : sans lui,
// « px-4 px-6 » laisserait les deux dans le DOM et le résultat dépendrait de l'ordre CSS.
export function cn(...entrees: ClassValue[]): string {
  return twMerge(clsx(entrees));
}

// Les prix sont des entiers de FCFA. L'espace insécable fine évite que « 165 000 » se coupe en
// fin de ligne. Contrat unique du projet : le suffixe est inclus.
export function formatFcfa(montant: number): string {
  return `${Math.round(montant).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} FCFA`;
}

export function formatDate(valeur: string | Date): string {
  return new Date(valeur).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
