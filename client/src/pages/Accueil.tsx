import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { listerProduits } from "../api/catalogue";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
import { classesBouton } from "../components/ui/Bouton";
import { SquelettesGrille } from "../components/ui/Skeleton";
import { BOUTIQUE } from "../lib/boutique";
import { lienWhatsApp } from "../lib/whatsapp";

const ETAPES = [
  {
    titre: "Choisissez",
    texte: "Parcourez la collection et ajoutez vos pièces au panier, dans la couleur qui vous plaît.",
  },
  {
    titre: "Envoyez sur WhatsApp",
    texte: "Votre commande part déjà rédigée. Précisez votre taille ou la senteur souhaitée dans le message.",
  },
  {
    titre: "Recevez",
    texte: `Nous confirmons la disponibilité, puis la livraison à ${BOUTIQUE.ville} ou l'envoi vers Libreville.`,
  },
];

export function Accueil() {
  const { data, isPending } = useQuery({
    queryKey: ["produits", "accueil"],
    queryFn: () => listerProduits({ limit: 6 }),
  });

  // La grille fait 3 colonnes sur large ecran : 4 ou 5 pieces laisseraient une vignette seule en
  // bas de rangee, ce qui donne l'impression d'une page inachevee. On n'affiche donc que des
  // rangees completes.
  const aAfficher = (() => {
    const tout = data?.items ?? [];
    if (tout.length >= 6) return tout.slice(0, 6);
    if (tout.length >= 3) return tout.slice(0, 3);
    return tout;
  })();

  return (
    <>
      {/* --- Hero ------------------------------------------------------------------------- */}
      {/* Photos fixes et non plus les visuels produits : ceux-ci sont souvent des affiches
          chargées de texte, illisibles en plein écran derrière le titre. */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-6 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-28 lg:pt-10">
        <div className="max-w-xl animate-fade-up">
          <p className="eyebrow-accent">L'Atelier d'{BOUTIQUE.nom} · {BOUTIQUE.ville}</p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] sm:text-7xl">
            L'élégance, <em className="text-accent">simplement</em>.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {BOUTIQUE.baseline}. Choisissez vos pièces en ligne, la commande se conclut sur WhatsApp.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/collection" className={classesBouton({ taille: "lg" })}>
              Découvrir la collection
            </Link>
            <a
              href={lienWhatsApp(`Bonjour ${BOUTIQUE.nom}, j'aimerais un renseignement.`, BOUTIQUE.numeroWhatsApp)}
              target="_blank"
              rel="noreferrer"
              className={classesBouton({ variante: "contour", taille: "lg" })}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Nous écrire
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-in lg:max-w-none">
          <img
            src="/accueil/ensemble-bordeaux.jpg"
            alt="Ensemble chemise et pantalon large bordeaux"
            className="aspect-[4/5] w-full rounded-[var(--radius)] object-cover shadow-card lg:ml-auto lg:w-[85%]"
          />
          {/* Seconde photo en décalé : elle casse la symétrie et montre d'emblée qu'il y a plusieurs
              styles, sans retomber dans un carrousel. */}
          <img
            src="/accueil/tunique-florale.jpg"
            alt="Tunique imprimée florale nouée au dos"
            className="absolute -bottom-8 -left-2 hidden aspect-[3/4] w-[38%] rounded-[calc(var(--radius)*0.66)] border-4 border-background object-cover shadow-card sm:block lg:left-0"
          />
        </div>
      </section>

      {/* --- Collection ------------------------------------------------------------------- */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow-accent">La collection</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Pièces disponibles</h2>
            </div>
            <Link
              to="/collection"
              className="link-underline inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em]"
            >
              Tout voir
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Reveal>

          <div className="rule-fade my-12" />

          {isPending ? (
            <SquelettesGrille nombre={3} />
          ) : aAfficher.length ? (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {aAfficher.map((produit, index) => (
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
        </div>
      </section>

      {/* --- Comment commander ------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow-accent">Commander</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Une conversation, pas un formulaire</h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Pas de compte à créer ni de carte à saisir : on règle ensemble la livraison et le paiement,
            comme en boutique.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {ETAPES.map((etape, index) => (
            <Reveal
              key={etape.titre}
              delai={index * 0.1}
              className="rounded-[var(--radius)] border border-border bg-card p-8 text-center"
            >
              <p className="font-serif text-5xl leading-none text-accent/40">0{index + 1}</p>
              <h3 className="mt-5 font-serif text-2xl">{etape.titre}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{etape.texte}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link to="/collection" className={classesBouton({ taille: "lg" })}>
            Choisir une pièce
          </Link>
        </div>
      </section>
    </>
  );
}
