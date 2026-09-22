import { apiFetch } from "../lib/api";
import type { Categorie, LigneValidee, PageResultats, ProduitDetail, ProduitVignette } from "./types";

export function listerCategories(): Promise<{ items: Categorie[] }> {
  return apiFetch<{ items: Categorie[] }>("/categories");
}

export type FiltresCollection = { category?: string; search?: string; page?: number; limit?: number };

export function listerProduits(filtres: FiltresCollection = {}): Promise<PageResultats<ProduitVignette>> {
  const parametres = new URLSearchParams();
  if (filtres.category) parametres.set("category", filtres.category);
  if (filtres.search?.trim()) parametres.set("search", filtres.search.trim());
  if (filtres.page) parametres.set("page", String(filtres.page));
  if (filtres.limit) parametres.set("limit", String(filtres.limit));

  const chaine = parametres.toString();
  return apiFetch<PageResultats<ProduitVignette>>(`/products${chaine ? `?${chaine}` : ""}`);
}

export function chargerProduit(slug: string): Promise<ProduitDetail> {
  return apiFetch<ProduitDetail>(`/products/${slug}`);
}

// Revalidation du panier local : prix, stock et existence de chaque teinte.
export function validerPanier(variantIds: string[]): Promise<{ items: LigneValidee[] }> {
  return apiFetch<{ items: LigneValidee[] }>("/cart/validate", {
    method: "POST",
    body: JSON.stringify({ variantIds }),
  });
}
