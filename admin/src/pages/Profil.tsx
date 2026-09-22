import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { mettreAJourProfil, type ModificationProfil } from "../api/users";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { useAdminAuth } from "../context/AdminAuthContext";
import { ApiError, type ErreursChamps } from "../lib/api";

export function Profil() {
  const { utilisateur, majUtilisateur, deconnecter } = useAdminAuth();

  const [identite, setIdentite] = useState({
    firstName: utilisateur?.firstName ?? "",
    lastName: utilisateur?.lastName ?? "",
    email: utilisateur?.email ?? "",
    phone: utilisateur?.phone ?? "",
  });
  const [motsDePasse, setMotsDePasse] = useState({ currentPassword: "", newPassword: "", confirmation: "" });
  const [erreurs, setErreurs] = useState<ErreursChamps>({});

  const surErreur = (erreur: unknown) => {
    if (erreur instanceof ApiError) {
      setErreurs(erreur.fieldErrors);
      toast.error(erreur.message);
    } else {
      toast.error("Impossible de joindre le serveur.");
    }
  };

  const mutation = useMutation({
    mutationFn: (modifications: ModificationProfil) => mettreAJourProfil(modifications),
    onSuccess: async (reponse) => {
      majUtilisateur(reponse.user);
      setMotsDePasse({ currentPassword: "", newPassword: "", confirmation: "" });

      // Changer de mot de passe révoque toutes les sessions côté serveur, celle-ci comprise :
      // rester sur la page donnerait l'illusion d'être encore connectée.
      if (reponse.sessionsRevoquees) {
        toast.success("Mot de passe modifié. Reconnecte-toi.");
        await deconnecter();
      } else {
        toast.success("Profil mis à jour.");
      }
    },
    onError: surErreur,
  });

  const enregistrerIdentite = (evenement: FormEvent) => {
    evenement.preventDefault();
    setErreurs({});
    mutation.mutate({
      firstName: identite.firstName,
      lastName: identite.lastName,
      email: identite.email,
      phone: identite.phone.trim() || null,
    });
  };

  const changerMotDePasse = (evenement: FormEvent) => {
    evenement.preventDefault();
    setErreurs({});

    // Contrôle côté navigateur : le serveur ne voit jamais la confirmation, c'est une sécurité
    // de saisie, pas une règle métier.
    if (motsDePasse.newPassword !== motsDePasse.confirmation) {
      setErreurs({ confirmation: ["Les deux mots de passe ne correspondent pas."] });
      return;
    }

    mutation.mutate({
      currentPassword: motsDePasse.currentPassword,
      newPassword: motsDePasse.newPassword,
    });
  };

  return (
    <div className="max-w-2xl space-y-10 animate-fade-in">
      <header>
        <p className="eyebrow-accent">Compte</p>
        <h1 className="mt-3 font-serif text-4xl">Profil</h1>
        <div className="rule-fade mt-6 w-32" />
      </header>

      <form onSubmit={enregistrerIdentite} className="card-soft space-y-6 p-6 sm:p-8">
        <h2 className="font-serif text-2xl">Identité</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" erreur={erreurs.firstName} obligatoire>
            <Input
              value={identite.firstName}
              onChange={(e) => setIdentite({ ...identite, firstName: e.target.value })}
              required
            />
          </Field>

          <Field label="Nom" erreur={erreurs.lastName} obligatoire>
            <Input
              value={identite.lastName}
              onChange={(e) => setIdentite({ ...identite, lastName: e.target.value })}
              required
            />
          </Field>

          <Field label="Adresse e-mail" erreur={erreurs.email} obligatoire className="sm:col-span-2">
            <Input
              type="email"
              value={identite.email}
              onChange={(e) => setIdentite({ ...identite, email: e.target.value })}
              autoComplete="username"
              required
            />
          </Field>

          <Field label="Téléphone" erreur={erreurs.phone} className="sm:col-span-2">
            <Input
              value={identite.phone}
              onChange={(e) => setIdentite({ ...identite, phone: e.target.value })}
              placeholder="Facultatif"
            />
          </Field>
        </div>

        <div className="flex justify-end">
          <Button type="submit" enCours={mutation.isPending}>
            Enregistrer
          </Button>
        </div>
      </form>

      <form onSubmit={changerMotDePasse} className="card-soft space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="font-serif text-2xl">Mot de passe</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Le changer ferme toutes les sessions ouvertes, y compris celle-ci.
          </p>
        </div>

        <Field label="Mot de passe actuel" erreur={erreurs.currentPassword} obligatoire>
          <Input
            type="password"
            value={motsDePasse.currentPassword}
            onChange={(e) => setMotsDePasse({ ...motsDePasse, currentPassword: e.target.value })}
            autoComplete="current-password"
            required
          />
        </Field>

        <Field label="Nouveau mot de passe" erreur={erreurs.newPassword} obligatoire aide="10 caractères minimum.">
          <Input
            type="password"
            value={motsDePasse.newPassword}
            onChange={(e) => setMotsDePasse({ ...motsDePasse, newPassword: e.target.value })}
            autoComplete="new-password"
            minLength={10}
            required
          />
        </Field>

        <Field label="Confirmation" erreur={erreurs.confirmation} obligatoire>
          <Input
            type="password"
            value={motsDePasse.confirmation}
            onChange={(e) => setMotsDePasse({ ...motsDePasse, confirmation: e.target.value })}
            autoComplete="new-password"
            minLength={10}
            required
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" variante="secondary" enCours={mutation.isPending}>
            Changer le mot de passe
          </Button>
        </div>
      </form>
    </div>
  );
}
