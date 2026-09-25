import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { useAdminAuth } from "../context/AdminAuthContext";
import { BOUTIQUE } from "../lib/boutique";
import { ApiError, type ErreursChamps } from "../lib/api";

export function Connexion() {
  const { utilisateur, chargementInitial, connecter } = useAdminAuth();
  const naviguer = useNavigate();
  const emplacement = useLocation();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreurs, setErreurs] = useState<ErreursChamps>({});

  // Déjà connecté : on renvoie là où la personne voulait aller, sinon au tableau de bord.
  if (!chargementInitial && utilisateur) {
    const destination = (emplacement.state as { depuis?: string } | null)?.depuis ?? "/";
    return <Navigate to={destination} replace />;
  }

  const surSoumission = async (evenement: FormEvent) => {
    evenement.preventDefault();
    setEnCours(true);
    setErreurs({});

    try {
      await connecter(email, motDePasse);
      const destination = (emplacement.state as { depuis?: string } | null)?.depuis ?? "/";
      naviguer(destination, { replace: true });
    } catch (erreur) {
      if (erreur instanceof ApiError) {
        setErreurs(erreur.fieldErrors);
        // 429 : la limite de 5 tentatives par minute côté API. Le dire explicitement évite de
        // croire que le mot de passe est faux.
        toast.error(
          erreur.status === 429
            ? "Trop de tentatives. Patiente une minute avant de réessayer."
            : erreur.message,
        );
      } else {
        toast.error("Impossible de joindre le serveur.");
      }
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-10 text-center">
          <p className="eyebrow-accent">Administration</p>
          <h1 className="mt-3 font-serif text-4xl">{BOUTIQUE.nom}</h1>
          <div className="rule-fade mx-auto mt-6 w-24" />
          <p className="mt-6 text-sm text-muted-foreground">
            Espace réservé à la gestion du catalogue.
          </p>
        </div>

        <form onSubmit={surSoumission} className="card-soft space-y-6 p-8">
          <Field label="Adresse e-mail" erreur={erreurs.email} obligatoire>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="vendeuse@exemple.com"
              required
            />
          </Field>

          <Field label="Mot de passe" erreur={erreurs.password} obligatoire>
            <Input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>

          <Button type="submit" className="w-full" enCours={enCours}>
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mot de passe oublié ? Il se réinitialise en ligne de commande, côté serveur.
        </p>
      </div>
    </div>
  );
}
