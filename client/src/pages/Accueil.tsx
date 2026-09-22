import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listerProduits } from "../api/catalogue";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
import { classesBouton } from "../components/ui/Bouton";
import { SquelettesGrille } from "../components/ui/Skeleton";
import { BOUTIQUE } from "../lib/boutique";
import { cn } from "../lib/utils";

const SAVOIR_FAIRE = [
  {
    titre: "Choisies une à une",
    texte:
      "Chaque matière est sélectionnée en petite quantité. Ce qui plaît est reconduit, le reste ne revient pas.",
  },
  {
    titre: "Façonnées à la main",
    texte: "Coupe, montage, finitions : tout se fait à l'atelier, sans chaîne de production.",
  },
  {
    titre: "En série très limitée",
    texte: "Quelques exemplaires par teinte. Quand une pièce part, elle n'est pas toujours refaite.",
  },
];

export function Accueil() {
  const { data, isPending } = useQuery({
    queryKey: ["produits", "accueil"],
    queryFn: () => listerProduits({ limit: 6 }),
  });

  const misEnAvant = data?.items.filter((produit) => produit.image).slice(0, 3) ?? [];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 5500, stopOnInteraction: false }),
  ]);
  const [indexActif, setIndexActif] = useState(0);

  const surSelection = useCallback(() => {
    if (emblaApi) setIndexActif(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    surSelection();
    emblaApi.on("select", surSelection);
    return () => {
      emblaApi.off("select", surSelection);
    };
  }, [emblaApi, surSelection]);

  return (
    <>
      {/* --- Hero ------------------------------------------------------------------------- */}
      <section className="relative -mt-[76px] h-[88vh] min-h-[560px] overflow-hidden">
        <div className="h-full" ref={emblaRef}>
          <div className="flex h-full">
            {(misEnAvant.length ? misEnAvant : [null]).map((produit, index) => (
              <div key={produit?.id ?? index} className="relative h-full min-w-0 flex-[0_0_100%]">
                {produit?.image ? (
                  <img src={produit.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-secondary" />
                )}
                {/* Voile dégradé : sans lui, le texte blanc devient illisible sur une photo claire. */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/25 to-foreground/40" />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
            <div className="max-w-xl animate-fade-up text-background">
              <p className="text-[0.6875rem] uppercase tracking-[0.35em] text-background/80">
                {BOUTIQUE.ville}
              </p>
              <h1 className="mt-6 font-serif text-5xl leading-[1.05] sm:text-7xl">{BOUTIQUE.nom}</h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-background/90 sm:text-base">
                {BOUTIQUE.baseline}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/collection"
                  className={classesBouton({
                    taille: "lg",
                    className: "bg-background text-foreground hover:bg-background/90",
                  })}
                >
                  Découvrir la collection
                </Link>
                <Link
                  to="/notre-histoire"
                  className={classesBouton({
                    variante: "contour",
                    taille: "lg",
                    className: "border-background/40 text-background hover:border-background",
                  })}
                >
                  Notre histoire
                </Link>
              </div>
            </div>
          </div>
        </div>

        {misEnAvant.length > 1 && (
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
            {misEnAvant.map((produit, index) => (
              <button
                key={produit.id}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Voir le visuel ${index + 1}`}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  index === indexActif ? "w-10 bg-background" : "w-5 bg-background/40",
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* --- Collection ------------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow-accent">La collection</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Pièces disponibles</h2>
          </div>
          <Link to="/collection" className="link-underline inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
            Tout voir
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Reveal>

        <div className="rule-fade my-12" />

        {isPending ? (
          <SquelettesGrille nombre={3} />
        ) : data?.items.length ? (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.slice(0, 6).map((produit, index) => (
              <Reveal key={produit.id} delai={index * 0.08}>
                <ProductCard produit={produit} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            La collection sera dévoilée très prochainement.
          </p>
        )}
      </section>

      {/* --- Savoir-faire ----------------------------------------------------------------- */}
      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
          <Reveal className="max-w-2xl">
            <p className="eyebrow-accent">Savoir-faire</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Peu de pièces, beaucoup d'attention
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {SAVOIR_FAIRE.map((bloc, index) => (
              <Reveal key={bloc.titre} delai={index * 0.1}>
                <p className="font-serif text-6xl leading-none text-accent/30">0{index + 1}</p>
                <h3 className="mt-6 font-serif text-2xl">{bloc.titre}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{bloc.texte}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- Commande par WhatsApp -------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow-accent">Commander</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Une conversation, pas un formulaire
          </h2>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Ici, pas de compte à créer ni de carte à saisir. Tu choisis tes pièces, et ta commande
            part sur WhatsApp, déjà rédigée. On règle ensemble la livraison et le paiement, comme
            dans une vraie boutique.
          </p>
          <Link to="/collection" className={classesBouton({ taille: "lg", className: "mt-10" })}>
            Choisir une pièce
          </Link>
        </Reveal>
      </section>
    </>
  );
}
