import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { listerCategories } from "../api/categories";
import {
  chargerProduit,
  creerProduit,
  mettreAJourProduit,
  supprimerProduit,
  type ChampsProduit,
} from "../api/products";
import { GestionVariantes } from "../components/GestionVariantes";
import { Button } from "../components/ui/Button";
import { Field, Input, Select, Textarea } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import { ApiError, type ErreursChamps } from "../lib/api";
import { formatFcfa } from "../lib/utils";

const CHAMPS_VIDES: ChampsProduit = {
  categoryId: "",
  line: "",
  name: "",
  ref: "",
  displayOrder: 0,
  price: 0,
  detail: "",
  shortDescription: "",
  story: "",
  designIntent: "",
  materials: "",
  craftsmanship: "",
  care: "",
  tag: "",
  isActive: true,
};

const TEXTES_EDITORIAUX = [
  { cle: "shortDescription", label: "Description courte", aide: "Une phrase, affichée sous le nom en fiche produit." },
  { cle: "detail", label: "Détails", aide: "Dimensions, poches, finitions." },
  { cle: "story", label: "Histoire", aide: "D'où vient cette pièce." },
  { cle: "designIntent", label: "Intention de design", aide: "Le parti pris assumé." },
  { cle: "materials", label: "Matières" },
  { cle: "craftsmanship", label: "Savoir-faire" },
  { cle: "care", label: "Entretien" },
] as const;

export function ProduitFormulaire() {
  const { id } = useParams<{ id: string }>();
  const creation = id === undefined;
  const naviguer = useNavigate();
  const clientRequetes = useQueryClient();

  const [champs, setChamps] = useState<ChampsProduit>(CHAMPS_VIDES);
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  const { data: produit, isPending } = useQuery({
    queryKey: ["produit", id],
    queryFn: () => chargerProduit(id as string),
    enabled: !creation,
  });

  // Le formulaire est piloté localement, mais doit repartir des valeurs du serveur dès qu'elles
  // arrivent — sinon l'édition afficherait des champs vides le temps du chargement.
  useEffect(() => {
    if (!produit) return;
    setChamps({
      categoryId: produit.categoryId,
      line: produit.line,
      name: produit.name,
      ref: produit.ref,
      displayOrder: produit.displayOrder,
      price: produit.price,
      detail: produit.detail,
      shortDescription: produit.shortDescription,
      story: produit.story,
      designIntent: produit.designIntent,
      materials: produit.materials,
      craftsmanship: produit.craftsmanship,
      care: produit.care,
      tag: produit.tag ?? "",
      isActive: produit.isActive,
    });
  }, [produit]);

  // Première catégorie présélectionnée à la création : un select vide ferait échouer la
  // validation sur un champ que la vendeuse n'a pas vu.
  useEffect(() => {
    if (creation && !champs.categoryId && categories?.items.length) {
      setChamps((precedent) => ({ ...precedent, categoryId: categories.items[0].id }));
    }
  }, [creation, categories, champs.categoryId]);

  const surErreur = (erreur: unknown) => {
    if (erreur instanceof ApiError) {
      setErreurs(erreur.fieldErrors);
      toast.error(erreur.message);
    } else {
      toast.error("Impossible de joindre le serveur.");
    }
  };

  const rafraichir = () => {
    clientRequetes.invalidateQueries({ queryKey: ["produit", id] });
    clientRequetes.invalidateQueries({ queryKey: ["produits"] });
    clientRequetes.invalidateQueries({ queryKey: ["tableau-de-bord"] });
  };

  const enregistrement = useMutation({
    mutationFn: (valeurs: ChampsProduit) => {
      const charge = { ...valeurs, tag: valeurs.tag?.trim() ? valeurs.tag.trim() : null };
      return creation ? creerProduit(charge) : mettreAJourProduit(id as string, charge);
    },
    onSuccess: (enregistre) => {
      rafraichir();
      if (creation) {
        toast.success("Produit créé. Ajoute maintenant ses teintes et ses photos.");
        // On bascule tout de suite sur la fiche : les teintes ont besoin de l'identifiant du
        // produit, qui n'existe qu'après la création.
        naviguer(`/produits/${enregistre.id}`, { replace: true });
      } else {
        toast.success("Modifications enregistrées.");
      }
    },
    onError: surErreur,
  });

  const suppression = useMutation({
    mutationFn: () => supprimerProduit(id as string),
    onSuccess: () => {
      toast.success("Produit supprimé.");
      // On ne touche surtout pas à la clé ["produit", id] : tant que cette page est montée, son
      // useQuery est actif, et aussi bien l'invalider que la retirer du cache déclencherait une
      // requête sur un produit qui vient d'être supprimé — un 404 pour rien. La navigation
      // démonte la page, et l'entrée périmée sera ramassée d'elle-même.
      clientRequetes.invalidateQueries({ queryKey: ["produits"] });
      clientRequetes.invalidateQueries({ queryKey: ["tableau-de-bord"] });
      naviguer("/produits", { replace: true });
    },
    onError: surErreur,
  });

  const surSoumission = (evenement: FormEvent) => {
    evenement.preventDefault();
    setErreurs({});
    enregistrement.mutate(champs);
  };

  if (!creation && isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="space-y-4">
        <Link to="/produits" className="link-underline inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Retour aux produits
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-accent">{creation ? "Nouvelle fiche" : "Modification"}</p>
            <h1 className="mt-3 font-serif text-4xl">{creation ? "Nouveau produit" : produit?.name}</h1>
          </div>

          {!creation && (
            <Button
              type="button"
              variante="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmationSuppression(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Supprimer
            </Button>
          )}
        </div>
      </header>

      <form onSubmit={surSoumission} className="space-y-8">
        <section className="card-soft space-y-6 p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Identité</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom" erreur={erreurs.name} obligatoire>
              <Input value={champs.name} onChange={(e) => setChamps({ ...champs, name: e.target.value })} required />
            </Field>

            <Field label="Ligne" erreur={erreurs.line} obligatoire aide="Le nom de la collection.">
              <Input value={champs.line} onChange={(e) => setChamps({ ...champs, line: e.target.value })} required />
            </Field>

            <Field label="Catégorie" erreur={erreurs.categoryId} obligatoire>
              <Select
                value={champs.categoryId}
                onChange={(e) => setChamps({ ...champs, categoryId: e.target.value })}
                required
              >
                {categories?.items.map((categorie) => (
                  <option key={categorie.id} value={categorie.id}>
                    {categorie.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Référence" erreur={erreurs.ref} obligatoire aide="Unique dans toute la boutique.">
              <Input
                value={champs.ref}
                onChange={(e) => setChamps({ ...champs, ref: e.target.value.toUpperCase() })}
                className="font-mono"
                required
              />
            </Field>

            <Field
              label="Prix en FCFA"
              erreur={erreurs.price}
              obligatoire
              aide={champs.price > 0 ? `Affiché : ${formatFcfa(champs.price)}` : "Entier, sans espace ni décimale."}
            >
              <Input
                type="number"
                min={0}
                step={1}
                value={champs.price}
                onChange={(e) => setChamps({ ...champs, price: Number(e.target.value) })}
                required
              />
            </Field>

            <Field
              label="Ordre d'affichage"
              erreur={erreurs.displayOrder}
              aide="Plus le nombre est petit, plus le produit apparaît tôt."
            >
              <Input
                type="number"
                min={0}
                value={champs.displayOrder}
                onChange={(e) => setChamps({ ...champs, displayOrder: Number(e.target.value) })}
              />
            </Field>

            <Field label="Étiquette" erreur={erreurs.tag} aide="Facultative : Nouveauté, Édition limitée…">
              <Input value={champs.tag ?? ""} onChange={(e) => setChamps({ ...champs, tag: e.target.value })} />
            </Field>

            <div className="flex items-end">
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3">
                <input
                  type="checkbox"
                  checked={champs.isActive}
                  onChange={(e) => setChamps({ ...champs, isActive: e.target.checked })}
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm">
                  {champs.isActive ? "Visible sur le site" : "Masqué du site"}
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="card-soft space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="font-serif text-2xl">Textes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ils alimentent l'accordéon de la fiche produit. Tous sont obligatoires.
            </p>
          </div>

          <div className="space-y-5">
            {TEXTES_EDITORIAUX.map(({ cle, label, ...reste }) => (
              <Field
                key={cle}
                label={label}
                erreur={erreurs[cle]}
                obligatoire
                aide={"aide" in reste ? reste.aide : undefined}
              >
                <Textarea
                  value={champs[cle]}
                  onChange={(e) => setChamps({ ...champs, [cle]: e.target.value })}
                  required
                />
              </Field>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <Link to="/produits" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            Annuler
          </Link>
          <Button type="submit" enCours={enregistrement.isPending}>
            {creation ? "Créer le produit" : "Enregistrer"}
          </Button>
        </div>
      </form>

      {creation ? (
        <p className="card-soft p-6 text-sm text-muted-foreground">
          Les teintes et les photos s'ajoutent une fois le produit créé : elles ont besoin de son
          identifiant, qui n'existe pas encore.
        </p>
      ) : produit ? (
        <GestionVariantes produitId={produit.id} variantes={produit.variants} onChangement={rafraichir} />
      ) : null}

      <Modal
        ouvert={confirmationSuppression}
        titre="Supprimer ce produit ?"
        description={produit ? `« ${produit.name} » disparaîtra du site.` : undefined}
        onFermer={() => setConfirmationSuppression(false)}
      >
        <p className="text-sm text-muted-foreground">
          Ses teintes et ses photos seront également supprimées, y compris sur Cloudinary. Cette
          action est irréversible.
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variante="ghost" onClick={() => setConfirmationSuppression(false)}>
            Annuler
          </Button>
          <Button variante="destructive" enCours={suppression.isPending} onClick={() => suppression.mutate()}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
