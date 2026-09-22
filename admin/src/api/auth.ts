import { apiFetch } from "../lib/api";
import type { ProfilAdmin } from "./types";

type ReponseSession = { accessToken: string; user: ProfilAdmin };

export function connecter(email: string, password: string): Promise<ReponseSession> {
  return apiFetch<ReponseSession>("/auth/admin-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function rafraichirSession(): Promise<ReponseSession> {
  return apiFetch<ReponseSession>("/auth/admin-refresh", { method: "POST" });
}

export function deconnecter(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/admin-logout", { method: "POST" });
}

export function profilCourant(): Promise<{ user: ProfilAdmin }> {
  return apiFetch<{ user: ProfilAdmin }>("/auth/me");
}
