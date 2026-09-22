const BASE_API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type ErreursChamps = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: ErreursChamps;
  readonly formErrors: string[];

  constructor(status: number, message: string, fieldErrors: ErreursChamps = {}, formErrors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.formErrors = formErrors;
  }

  // Le backend répond { message, errors: { fieldErrors, formErrors } }. Un toast qui n'affiche
  // que « Certains champs sont invalides » n'aide personne : on reconstruit un message qui dit
  // lesquels, tout en gardant fieldErrors pour surligner les champs du formulaire.
  static depuisReponse(status: number, corps: unknown): ApiError {
    const detail = (corps ?? {}) as {
      message?: string;
      errors?: { fieldErrors?: ErreursChamps; formErrors?: string[] };
    };

    const fieldErrors = detail.errors?.fieldErrors ?? {};
    const formErrors = detail.errors?.formErrors ?? [];

    const messagesChamps = Object.values(fieldErrors)
      .flat()
      .filter((texte): texte is string => Boolean(texte));

    const message =
      [...formErrors, ...messagesChamps].join(" ") ||
      detail.message ||
      messageParDefaut(status);

    return new ApiError(status, message, fieldErrors, formErrors);
  }
}

function messageParDefaut(status: number): string {
  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 404) return "Élément introuvable.";
  if (status === 429) return "Trop de tentatives. Patiente une minute.";
  if (status >= 500) return "Le serveur ne répond pas correctement. Réessaie dans un instant.";
  return "La requête a échoué.";
}

// Le jeton d'accès ne vit qu'ici, en mémoire JavaScript : jamais dans localStorage, où une
// injection de script pourrait le lire. Un rechargement de page le perd — c'est le cookie de
// rafraîchissement, lui httpOnly, qui permet de le regagner silencieusement.
let jetonAcces: string | null = null;

export function definirJetonAcces(jeton: string | null): void {
  jetonAcces = jeton;
}

export function lireJetonAcces(): string | null {
  return jetonAcces;
}

type Rafraichisseur = () => Promise<string | null>;

let rafraichisseur: Rafraichisseur | null = null;

// Enregistré par AdminAuthContext plutôt qu'importé : sans ça, api.ts et le contexte
// s'importeraient mutuellement.
export function enregistrerRafraichisseur(fonction: Rafraichisseur | null): void {
  rafraichisseur = fonction;
}

// Rafraîchissement partagé : si trois requêtes prennent un 401 en même temps, elles attendent le
// même appel au lieu d'en déclencher trois — dont deux échoueraient, le jeton ayant tourné.
let rafraichissementEnCours: Promise<string | null> | null = null;

function rafraichirUneSeuleFois(): Promise<string | null> {
  if (!rafraichisseur) return Promise.resolve(null);

  if (!rafraichissementEnCours) {
    rafraichissementEnCours = rafraichisseur().finally(() => {
      rafraichissementEnCours = null;
    });
  }

  return rafraichissementEnCours;
}

function construireEntetes(init: RequestInit, jeton: string | null): Headers {
  const entetes = new Headers(init.headers);

  // Sur un FormData, le navigateur doit poser lui-même le Content-Type avec sa frontière
  // multipart. L'imposer casserait l'envoi de fichier.
  if (init.body && !(init.body instanceof FormData) && !entetes.has("Content-Type")) {
    entetes.set("Content-Type", "application/json");
  }

  if (jeton) entetes.set("Authorization", `Bearer ${jeton}`);

  return entetes;
}

export async function apiFetch<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  const url = `${BASE_API}${chemin}`;
  // Les routes d'authentification ne sont jamais rejouées : rafraîchir après l'échec d'un
  // rafraîchissement bouclerait à l'infini.
  const estRouteAuth = chemin.startsWith("/auth/");

  const envoyer = async (jeton: string | null): Promise<Response> =>
    fetch(url, {
      ...init,
      headers: construireEntetes(init, jeton),
      // Indispensable pour que le cookie de rafraîchissement voyage, y compris entre deux
      // domaines distincts (Vercel et Render en production).
      credentials: "include",
    });

  let reponse = await envoyer(jetonAcces);

  if (reponse.status === 401 && !estRouteAuth) {
    const nouveauJeton = await rafraichirUneSeuleFois();
    // Une seule tentative, comme prévu : si elle échoue aussi, l'erreur remonte au contexte
    // d'authentification qui déconnectera proprement.
    if (nouveauJeton) reponse = await envoyer(nouveauJeton);
  }

  if (reponse.status === 204) return undefined as T;

  const corps = await reponse.json().catch(() => null);

  if (!reponse.ok) throw ApiError.depuisReponse(reponse.status, corps);

  return corps as T;
}

export async function apiUpload<T>(chemin: string, fichier: File): Promise<T> {
  const corps = new FormData();
  corps.append("file", fichier);
  return apiFetch<T>(chemin, { method: "POST", body: corps });
}
