import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ajouterVariante, mettreAJourVariante, supprimerVariante, type ChampsVariante } from "../api/products";
import type { VarianteProduit } from "../api/types";
import { ApiError, type ErreursChamps } from "../lib/api";
import { GalerieVariante } from "./GalerieVariante";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Field";
import { Modal } from "./ui/Modal";

const VARIANTE_VIDE: ChampsVariante = { colorName: "", swatchHex: "#C9A227", sku: "", stock: 0 };

type Props = {
  produitId: string;
  variantes: VarianteProduit[];
  onChangement: () => void;
};

export function GestionVariantes({ produitId, variantes, onChangement }: Props) {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [champs, setChamps] = useState<ChampsVariante>(VARIANTE_VIDE);
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [aSupprimer, setASupprimer] = useState<VarianteProduit | null>(null);

  const surErreur = (erreur: unknown) => {
    if (erreur instanceof ApiError) {
      setErreurs(erreur.fieldErrors);
      toast.error(erreur.message);
    } else {
      toast.error("Impossible de joindre le serveur.");
    }
  };

  const creation = useMutation({
    mutationFn: (valeurs: ChampsVariante) => ajouterVariante(produitId, valeurs),
    onSuccess: () => {
      toast.success("Teinte ajoutée.");
      setFormulaireOuvert(false);
      setChamps(VARIANTE_VIDE);
      onChangement();
    },
    onError: surErreur,
  });

  const majStock = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => mettreAJourVariante(id, { stock }),
    onSuccess: onChangement,
    onError: surErreur,
  });

  const suppression = useMutation({
    mutationFn: (id: string) => supprimerVariante(id),
    onSuccess: () => {
      toast.success("Teinte supprimée.");
      setASupprimer(null);
      onChangement();
    },
    onError: (erreur) => {
      setASupprimer(null);
      surErreur(erreur);
    },
  });

  const surSoumission = (evenement: FormEvent) => {
    evenement.preventDefault();
    setErreurs({});
    creation.mutate(champs);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Teintes et photos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            C'est la teinte qui porte le stock et les photos, pas le produit.
          </p>
        </div>

        <Button
          type="button"
          variante="secondary"
          onClick={() => {
            setChamps(VARIANTE_VIDE);
            setErreurs({});
            setFormulaireOuvert(true);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter une teinte
        </Button>
      </div>

      {variantes.length === 0 ? (
        <div className="card-soft border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm">
            Ce produit n'a aucune teinte : il s'affichera comme épuisé et ne pourra pas être commandé.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {variantes.map((variante) => (
            <article key={variante.id} className="card-soft space-y-5 p-6">
              <div className="flex flex-wrap items-center gap-4">
                <span
                  className="h-10 w-10 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: variante.swatchHex }}
                  aria-hidden
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate">{variante.colorName}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{variante.sku}</p>
                </div>

                <label className="flex items-center gap-3">
                  <span className="eyebrow">Stock</span>
                  <Input
                    type="number"
                    min={0}
                    defaultValue={variante.stock}
                    // Mise à jour à la sortie du champ et non à chaque frappe : sinon taper « 12 »
                    // enverrait d'abord un stock de 1.
                    onBlur={(evenement) => {
                      const valeur = Number(evenement.target.value);
                      if (Number.isInteger(valeur) && valeur >= 0 && valeur !== variante.stock) {
                        majStock.mutate({ id: variante.id, stock: valeur });
                      }
                    }}
                    className="w-24 py-2 text-center"
                    aria-label={`Stock de la teinte ${variante.colorName}`}
                  />
                </label>

                {variante.stock === 0 ? (
                  <Badge ton="danger">Épuisée</Badge>
                ) : variante.stock <= 3 ? (
                  <Badge ton="alerte">Dernières pièces</Badge>
                ) : (
                  <Badge ton="succes">Disponible</Badge>
                )}

                <Button
                  type="button"
                  variante="ghost"
                  taille="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setASupprimer(variante)}
                  aria-label={`Supprimer la teinte ${variante.colorName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <GalerieVariante varianteId={variante.id} images={variante.images} onChangement={onChangement} />
            </article>
          ))}
        </div>
      )}

      <Modal ouvert={formulaireOuvert} titre="Nouvelle teinte" onFermer={() => setFormulaireOuvert(false)}>
        <form onSubmit={surSoumission} className="space-y-5">
          <Field label="Nom de la teinte" erreur={erreurs.colorName} obligatoire>
            <Input
              value={champs.colorName}
              onChange={(e) => setChamps({ ...champs, colorName: e.target.value })}
              placeholder="Noisette, Noir Encre…"
              autoFocus
              required
            />
          </Field>

          <Field label="Pastille de couleur" erreur={erreurs.swatchHex} obligatoire aide="Elle est affichée telle quelle sur la fiche produit.">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={champs.swatchHex}
                onChange={(e) => setChamps({ ...champs, swatchHex: e.target.value })}
                className="h-12 w-16 shrink-0 cursor-pointer rounded-xl border border-input bg-card"
                aria-label="Choisir la couleur"
              />
              <Input
                value={champs.swatchHex}
                onChange={(e) => setChamps({ ...champs, swatchHex: e.target.value })}
                pattern="#[0-9a-fA-F]{6}"
                className="font-mono"
                required
              />
            </div>
          </Field>

          <Field label="SKU" erreur={erreurs.sku} obligatoire aide="Identifiant interne, unique dans toute la boutique.">
            <Input
              value={champs.sku}
              onChange={(e) => setChamps({ ...champs, sku: e.target.value.toUpperCase() })}
              placeholder="SAC-AMB-01-NOI"
              className="font-mono"
              required
            />
          </Field>

          <Field label="Stock initial" erreur={erreurs.stock}>
            <Input
              type="number"
              min={0}
              value={champs.stock}
              onChange={(e) => setChamps({ ...champs, stock: Number(e.target.value) })}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variante="ghost" onClick={() => setFormulaireOuvert(false)}>
              Annuler
            </Button>
            <Button type="submit" enCours={creation.isPending}>
              Ajouter
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        ouvert={aSupprimer !== null}
        titre="Supprimer cette teinte ?"
        description={aSupprimer ? `« ${aSupprimer.colorName} » et ses photos seront supprimées.` : undefined}
        onFermer={() => setASupprimer(null)}
      >
        <p className="text-sm text-muted-foreground">
          Les photos seront également retirées de Cloudinary. Cette action est irréversible.
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
    </section>
  );
}
