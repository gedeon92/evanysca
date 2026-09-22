import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { creerCategorie, listerCategories, renommerCategorie, supprimerCategorie } from "../api/categories";
import type { Categorie } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import { ApiError, type ErreursChamps } from "../lib/api";

type Edition = { mode: "creation" } | { mode: "renommage"; categorie: Categorie } | null;

export function Categories() {
  const clientRequetes = useQueryClient();
  const [edition, setEdition] = useState<Edition>(null);
  const [aSupprimer, setASupprimer] = useState<Categorie | null>(null);
  const [nom, setNom] = useState("");
  const [erreurs, setErreurs] = useState<ErreursChamps>({});

  const { data, isPending } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  const rafraichir = () => {
    clientRequetes.invalidateQueries({ queryKey: ["categories"] });
    // Le tableau de bord et la liste de produits affichent aussi des catégories : les laisser en
    // cache après un renommage montrerait l'ancien nom.
    clientRequetes.invalidateQueries({ queryKey: ["tableau-de-bord"] });
    clientRequetes.invalidateQueries({ queryKey: ["produits"] });
  };

  const surErreur = (erreur: unknown) => {
    if (erreur instanceof ApiError) {
      setErreurs(erreur.fieldErrors);
      toast.error(erreur.message);
    } else {
      toast.error("Impossible de joindre le serveur.");
    }
  };

  const creation = useMutation({
    mutationFn: (valeur: string) => creerCategorie(valeur),
    onSuccess: () => {
      toast.success("Catégorie créée.");
      fermer();
      rafraichir();
    },
    onError: surErreur,
  });

  const renommage = useMutation({
    mutationFn: ({ id, valeur }: { id: string; valeur: string }) => renommerCategorie(id, valeur),
    onSuccess: () => {
      toast.success("Catégorie renommée.");
      fermer();
      rafraichir();
    },
    onError: surErreur,
  });

  const suppression = useMutation({
    mutationFn: (id: string) => supprimerCategorie(id),
    onSuccess: () => {
      toast.success("Catégorie supprimée.");
      setASupprimer(null);
      rafraichir();
    },
    onError: (erreur) => {
      // Le backend refuse la suppression si des produits utilisent la catégorie, et son message
      // dit combien : on le montre tel quel plutôt que d'en inventer un plus vague.
      setASupprimer(null);
      surErreur(erreur);
    },
  });

  const ouvrirCreation = () => {
    setNom("");
    setErreurs({});
    setEdition({ mode: "creation" });
  };

  const ouvrirRenommage = (categorie: Categorie) => {
    setNom(categorie.name);
    setErreurs({});
    setEdition({ mode: "renommage", categorie });
  };

  const fermer = () => {
    setEdition(null);
    setErreurs({});
  };

  const surSoumission = (evenement: FormEvent) => {
    evenement.preventDefault();
    setErreurs({});
    if (!edition) return;

    if (edition.mode === "creation") creation.mutate(nom);
    else renommage.mutate({ id: edition.categorie.id, valeur: nom });
  };

  const enCours = creation.isPending || renommage.isPending;

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-accent">Catalogue</p>
          <h1 className="mt-3 font-serif text-4xl">Catégories</h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Elles structurent la page Collection du site. Le lien est fabriqué automatiquement à
            partir du nom.
          </p>
        </div>

        <Button onClick={ouvrirCreation} className="shrink-0">
          <Plus className="h-4 w-4" aria-hidden />
          Nouvelle catégorie
        </Button>
      </header>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="card-soft p-12 text-center">
          <p className="font-serif text-2xl">Aucune catégorie</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crée une première catégorie avant d'ajouter des produits.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.items.map((categorie) => (
            <li key={categorie.id} className="card-soft flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="truncate">{categorie.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">/{categorie.slug}</p>
              </div>

              <Badge ton={categorie.productCount > 0 ? "accent" : "neutre"}>
                {categorie.productCount} produit{categorie.productCount > 1 ? "s" : ""}
              </Badge>

              <div className="flex items-center gap-2">
                <Button
                  variante="ghost"
                  taille="icon"
                  onClick={() => ouvrirRenommage(categorie)}
                  aria-label={`Renommer ${categorie.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variante="ghost"
                  taille="icon"
                  onClick={() => setASupprimer(categorie)}
                  aria-label={`Supprimer ${categorie.name}`}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        ouvert={edition !== null}
        titre={edition?.mode === "renommage" ? "Renommer la catégorie" : "Nouvelle catégorie"}
        onFermer={fermer}
      >
        <form onSubmit={surSoumission} className="space-y-6">
          <Field label="Nom" erreur={erreurs.name ?? erreurs.slug} obligatoire aide="Par exemple : Sacs, Bijoux, Écharpes.">
            <Input value={nom} onChange={(e) => setNom(e.target.value)} autoFocus required minLength={2} />
          </Field>

          <div className="flex justify-end gap-3">
            <Button type="button" variante="ghost" onClick={fermer}>
              Annuler
            </Button>
            <Button type="submit" enCours={enCours}>
              {edition?.mode === "renommage" ? "Renommer" : "Créer"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        ouvert={aSupprimer !== null}
        titre="Supprimer cette catégorie ?"
        description={aSupprimer ? `« ${aSupprimer.name} » sera définitivement supprimée.` : undefined}
        onFermer={() => setASupprimer(null)}
      >
        <p className="text-sm text-muted-foreground">
          {aSupprimer && aSupprimer.productCount > 0
            ? `Cette catégorie contient ${aSupprimer.productCount} produit(s). La suppression sera refusée tant qu'ils y sont rattachés.`
            : "Cette action est irréversible."}
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variante="ghost" onClick={() => setASupprimer(null)}>
            Annuler
          </Button>
          <Button
            variante="destructive"
            enCours={suppression.isPending}
            onClick={() => aSupprimer && suppression.mutate(aSupprimer.id)}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
