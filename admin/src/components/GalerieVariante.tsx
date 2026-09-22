import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { ajouterImage, deplacerImage, supprimerImage } from "../api/products";
import type { ImageProduit } from "../api/types";
import { televerserImage } from "../api/uploads";
import { ApiError } from "../lib/api";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";

const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp"];
const TAILLE_MAX = 5 * 1024 * 1024;

type Props = {
  varianteId: string;
  images: ImageProduit[];
  onChangement: () => void;
};

export function GalerieVariante({ varianteId, images, onChangement }: Props) {
  const [survol, setSurvol] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const champFichier = useRef<HTMLInputElement>(null);

  const surErreur = (erreur: unknown) => {
    toast.error(erreur instanceof ApiError ? erreur.message : "L'opération a échoué.");
  };

  const deplacement = useMutation({
    mutationFn: ({ id, position }: { id: string; position: number }) => deplacerImage(id, position),
    onSuccess: onChangement,
    onError: surErreur,
  });

  const suppression = useMutation({
    mutationFn: (id: string) => supprimerImage(id),
    onSuccess: () => {
      toast.success("Image supprimée.");
      onChangement();
    },
    onError: surErreur,
  });

  // Les fichiers passent d'abord par Cloudinary, puis leur URL est rattachée à la variante. Le
  // publicId récupéré ici est ce qui permettra de supprimer le fichier distant plus tard.
  const envoyerFichiers = async (fichiers: FileList | null) => {
    if (!fichiers?.length) return;

    const retenus = Array.from(fichiers).filter((fichier) => {
      if (!TYPES_ACCEPTES.includes(fichier.type)) {
        toast.error(`« ${fichier.name} » : format non accepté (JPEG, PNG ou WebP).`);
        return false;
      }
      if (fichier.size > TAILLE_MAX) {
        toast.error(`« ${fichier.name} » dépasse 5 Mo.`);
        return false;
      }
      return true;
    });

    if (!retenus.length) return;

    setEnvoiEnCours(true);
    let reussites = 0;

    // Envoi séquentiel : en parallèle, les positions d'arrivée deviendraient imprévisibles et
    // l'ordre choisi par la vendeuse serait perdu.
    for (const fichier of retenus) {
      try {
        const televersee = await televerserImage(fichier);
        await ajouterImage(varianteId, { url: televersee.url, publicId: televersee.publicId });
        reussites += 1;
      } catch (erreur) {
        surErreur(erreur);
        break;
      }
    }

    setEnvoiEnCours(false);
    if (reussites > 0) {
      toast.success(`${reussites} image${reussites > 1 ? "s ajoutées" : " ajoutée"}.`);
      onChangement();
    }
    if (champFichier.current) champFichier.current.value = "";
  };

  const surDepot = (evenement: DragEvent<HTMLDivElement>) => {
    evenement.preventDefault();
    setSurvol(false);
    void envoyerFichiers(evenement.dataTransfer.files);
  };

  const occupe = envoiEnCours || deplacement.isPending || suppression.isPending;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(evenement) => {
          evenement.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={surDepot}
        className={cn(
          "rounded-2xl border border-dashed p-6 text-center transition-colors",
          survol ? "border-accent bg-accent/5" : "border-border bg-muted/40",
        )}
      >
        <input
          ref={champFichier}
          type="file"
          accept={TYPES_ACCEPTES.join(",")}
          multiple
          className="hidden"
          onChange={(evenement) => void envoyerFichiers(evenement.target.files)}
        />

        {envoiEnCours ? (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Envoi en cours…
          </p>
        ) : (
          <>
            <ImagePlus className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">
              Glisse des photos ici, ou{" "}
              <button
                type="button"
                onClick={() => champFichier.current?.click()}
                className="link-underline text-foreground"
              >
                choisis des fichiers
              </button>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG ou WebP — 5 Mo maximum.</p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card">
              <img src={image.url} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />

              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-1 text-[0.5625rem] uppercase tracking-[0.2em] text-primary-foreground">
                  Principale
                </span>
              )}

              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variante="ghost"
                    taille="icon"
                    className="h-8 w-8"
                    disabled={index === 0 || occupe}
                    onClick={() => deplacement.mutate({ id: image.id, position: index - 1 })}
                    aria-label="Déplacer vers la gauche"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variante="ghost"
                    taille="icon"
                    className="h-8 w-8"
                    disabled={index === images.length - 1 || occupe}
                    onClick={() => deplacement.mutate({ id: image.id, position: index + 1 })}
                    aria-label="Déplacer vers la droite"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  type="button"
                  variante="ghost"
                  taille="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  disabled={occupe}
                  onClick={() => suppression.mutate(image.id)}
                  aria-label="Supprimer cette image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {images.length === 0 && !envoiEnCours && (
        <p className="text-xs text-muted-foreground">
          Sans photo, cette teinte s'affichera sans visuel sur le site.
        </p>
      )}
    </div>
  );
}
