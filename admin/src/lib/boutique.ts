// Le back-office affiche le nom de la marque au même titre que la boutique. Il le lit dans la
// même variable, pour qu'un changement de nom se fasse en un seul geste des deux côtés.
export const BOUTIQUE = {
  nom: (import.meta.env.VITE_BRAND_NAME ?? "").trim() || "Evanysca",
} as const;
