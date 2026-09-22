const BASE_API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type ErreursChamps = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: ErreursChamps;

  constructor(status: number, message: string, fieldErrors: ErreursChamps = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  static depuisReponse(status: number, corps: unknown): ApiError {
    const detail = (corps ?? {}) as {
      message?: string;
      errors?: { fieldErrors?: ErreursChamps; formErrors?: string[] };
    };

    const fieldErrors = detail.errors?.fieldErrors ?? {};
    const messages = [...(detail.errors?.formErrors ?? []), ...Object.values(fieldErrors).flat()];

    const message =
      messages.filter(Boolean).join(" ") ||
      detail.message ||
      (status === 404
        ? "Cette pièce n'est plus disponible."
        : status >= 500
          ? "La boutique est momentanément injoignable. Réessaie dans un instant."
          : "La requête a échoué.");

    return new ApiError(status, message, fieldErrors);
  }
}

export async function apiFetch<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  const entetes = new Headers(init.headers);
  if (init.body && !entetes.has("Content-Type")) entetes.set("Content-Type", "application/json");

  const reponse = await fetch(`${BASE_API}${chemin}`, {
    ...init,
    headers: entetes,
    // Aucun compte client sur ce site, mais l'API partage la même configuration CORS que l'admin.
    credentials: "include",
  });

  if (reponse.status === 204) return undefined as T;

  const corps = await reponse.json().catch(() => null);
  if (!reponse.ok) throw ApiError.depuisReponse(reponse.status, corps);

  return corps as T;
}
