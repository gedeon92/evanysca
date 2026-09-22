import { apiFetch } from "../lib/api";
import type { ImageProduit, LigneProduitAdmin, PageResultats, ProduitAdmin, VarianteProduit } from "./types";

export type FiltresProduits = {
  search?: string;
  category?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  limit?: number;
};

export type ChampsProduit = {
  categoryId: string;
  line: string;
  name: string;
  slug?: string;
  ref: string;
  displayOrder: number;
  price: number;
  detail: string;
  shortDescription: string;
  story: string;
  designIntent: string;
  materials: string;
  craftsmanship: string;
  care: string;
  tag?: string | null;
  isActive: boolean;
};

export type ChampsVariante = {
  colorName: string;
  swatchHex: string;
  sku: string;
  stock: number;
};

function versParametres(filtres: FiltresProduits): string {
  const parametres = new URLSearchParams();
  // Les valeurs vides ne sont pas envoyées : « ?search= » ferait chercher la chaîne vide au lieu
  // de ne pas filtrer du tout.
  if (filtres.search?.trim()) parametres.set("search", filtres.search.trim());
  if (filtres.category) parametres.set("category", filtres.category);
  if (filtres.status && filtres.status !== "all") parametres.set("status", filtres.status);
  if (filtres.page) parametres.set("page", String(filtres.page));
  if (filtres.limit) parametres.set("limit", String(filtres.limit));
  const chaine = parametres.toString();
  return chaine ? `?${chaine}` : "";
}

export function listerProduits(filtres: FiltresProduits = {}): Promise<PageResultats<LigneProduitAdmin>> {
  return apiFetch<PageResultats<LigneProduitAdmin>>(`/admin/products${versParametres(filtres)}`);
}

export function chargerProduit(id: string): Promise<ProduitAdmin> {
  return apiFetch<ProduitAdmin>(`/admin/products/${id}`);
}

export function creerProduit(champs: ChampsProduit): Promise<ProduitAdmin> {
  return apiFetch<ProduitAdmin>("/admin/products", { method: "POST", body: JSON.stringify(champs) });
}

export function mettreAJourProduit(id: string, champs: Partial<ChampsProduit>): Promise<ProduitAdmin> {
  return apiFetch<ProduitAdmin>(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(champs) });
}

export function supprimerProduit(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/products/${id}`, { method: "DELETE" });
}

export function ajouterVariante(produitId: string, champs: ChampsVariante): Promise<VarianteProduit> {
  return apiFetch<VarianteProduit>(`/admin/products/${produitId}/variants`, {
    method: "POST",
    body: JSON.stringify(champs),
  });
}

export function mettreAJourVariante(id: string, champs: Partial<ChampsVariante>): Promise<VarianteProduit> {
  return apiFetch<VarianteProduit>(`/admin/variants/${id}`, { method: "PATCH", body: JSON.stringify(champs) });
}

export function supprimerVariante(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/variants/${id}`, { method: "DELETE" });
}

export function ajouterImage(
  varianteId: string,
  image: { url: string; publicId?: string | null },
): Promise<{ images: ImageProduit[] }> {
  return apiFetch<{ images: ImageProduit[] }>(`/admin/variants/${varianteId}/images`, {
    method: "POST",
    body: JSON.stringify(image),
  });
}

export function deplacerImage(id: string, position: number): Promise<{ images: ImageProduit[] }> {
  return apiFetch<{ images: ImageProduit[] }>(`/admin/images/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ position }),
  });
}

export function supprimerImage(id: string): Promise<{ images: ImageProduit[] }> {
  return apiFetch<{ images: ImageProduit[] }>(`/admin/images/${id}`, { method: "DELETE" });
}
