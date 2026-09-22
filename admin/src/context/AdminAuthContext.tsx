import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { connecter as connecterApi, deconnecter as deconnecterApi, rafraichirSession } from "../api/auth";
import type { ProfilAdmin } from "../api/types";
import { definirJetonAcces, enregistrerRafraichisseur } from "../lib/api";

type ContexteAuth = {
  utilisateur: ProfilAdmin | null;
  // Distinct de « pas connecté » : au premier rendu on ne sait pas encore si le cookie de
  // rafraîchissement va rendre une session. Rediriger tout de suite ferait clignoter la page.
  chargementInitial: boolean;
  connecter: (email: string, motDePasse: string) => Promise<void>;
  deconnecter: () => Promise<void>;
  majUtilisateur: (utilisateur: ProfilAdmin) => void;
};

const Contexte = createContext<ContexteAuth | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<ProfilAdmin | null>(null);
  const [chargementInitial, setChargementInitial] = useState(true);

  const terminerSession = useCallback(() => {
    definirJetonAcces(null);
    setUtilisateur(null);
  }, []);

  // Branché sur apiFetch : c'est cette fonction qu'il appelle quand une requête prend un 401.
  useEffect(() => {
    enregistrerRafraichisseur(async () => {
      try {
        const session = await rafraichirSession();
        definirJetonAcces(session.accessToken);
        setUtilisateur(session.user);
        return session.accessToken;
      } catch {
        terminerSession();
        return null;
      }
    });

    return () => enregistrerRafraichisseur(null);
  }, [terminerSession]);

  // Au chargement de l'application, le jeton d'accès est perdu (il ne vit qu'en mémoire). On
  // tente une seule fois de le regagner via le cookie httpOnly, sans quoi tout rechargement de
  // page déconnecterait la vendeuse.
  useEffect(() => {
    let annule = false;

    rafraichirSession()
      .then((session) => {
        if (annule) return;
        definirJetonAcces(session.accessToken);
        setUtilisateur(session.user);
      })
      .catch(() => {
        if (!annule) terminerSession();
      })
      .finally(() => {
        if (!annule) setChargementInitial(false);
      });

    return () => {
      annule = true;
    };
  }, [terminerSession]);

  const connecter = useCallback(async (email: string, motDePasse: string) => {
    const session = await connecterApi(email, motDePasse);
    definirJetonAcces(session.accessToken);
    setUtilisateur(session.user);
  }, []);

  const deconnecter = useCallback(async () => {
    // L'échec de l'appel réseau ne doit pas empêcher la déconnexion locale : sinon une coupure
    // laisserait la session ouverte à l'écran.
    await deconnecterApi().catch(() => undefined);
    terminerSession();
  }, [terminerSession]);

  const valeur = useMemo<ContexteAuth>(
    () => ({ utilisateur, chargementInitial, connecter, deconnecter, majUtilisateur: setUtilisateur }),
    [utilisateur, chargementInitial, connecter, deconnecter],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useAdminAuth(): ContexteAuth {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("useAdminAuth doit être utilisé dans un AdminAuthProvider.");
  return contexte;
}
