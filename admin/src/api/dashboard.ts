import { apiFetch } from "../lib/api";
import type { ResumeTableauDeBord } from "./types";

export function chargerTableauDeBord(): Promise<ResumeTableauDeBord> {
  return apiFetch<ResumeTableauDeBord>("/admin/dashboard");
}
