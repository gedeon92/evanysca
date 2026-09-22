import { apiFetch } from "../lib/api";
import type { Categorie } from "./types";

export function listerCategories(): Promise<{ items: Categorie[] }> {
  return apiFetch<{ items: Categorie[] }>("/admin/categories");
}

export function creerCategorie(name: string): Promise<Categorie> {
  return apiFetch<Categorie>("/admin/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function renommerCategorie(id: string, name: string): Promise<Categorie> {
  return apiFetch<Categorie>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function supprimerCategorie(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" });
}
