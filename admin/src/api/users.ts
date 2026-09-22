import { apiFetch } from "../lib/api";
import type { ProfilAdmin } from "./types";

export type ModificationProfil = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  currentPassword?: string;
  newPassword?: string;
};

export function mettreAJourProfil(
  modifications: ModificationProfil,
): Promise<{ user: ProfilAdmin; sessionsRevoquees: boolean }> {
  return apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(modifications) });
}
