import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { listerCategories, listerProduits } from "../api/catalogue";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
import { classesBouton } from "../components/ui/Bouton";
import { SquelettesGrille } from "../components/ui/Skeleton";
import { BOUTIQUE } from "../lib/boutique";
import { lienWhatsApp } from "../lib/whatsapp";

// Une photo d'ambiance par univers. Les catégories absentes de cette liste, ou vides, ne sont pas
// montrées : une vignette sans photo casserait la rangée.
const UNIVERS: Record<string, { image: string; accroche: string }> = {
  femme: { image: "/accueil/univers-femme.jpg", accroche: "Boubous, ensembles et robes" },
  homme: { image: "/accueil/univers-homme.jpg", accroche: "Grands boubous et tuniques brodées" },
  "parfums-senteurs": { image: "/accueil/univers-parfums.jpg", accroche: "Parfums, huiles et senteurs" },
  decoration: { image: "/accueil/univers-deco.jpg", accroche: "Plateaux et ambiances parfumées" },
};

const BANDEAU = ["Boubous brodés", "Ensembles", "Parfums d'exception", "Décoration", BOUTIQUE.ville];

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
    texte: "Nous confirmons la disponibilité avec vous, puis nous convenons ensemble de la livraison.",
  },
];

export function Accueil() {
  const { data, isPending } = useQuery({
    queryKey: ["produits", "accueil"],
    queryFn: () => listerProduits({ limit: 8 }),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  // 4 colonnes sur ordinateur, 2 sur téléphone : on n'affiche que des rangées complètes, une
  // vignette seule en bout de ligne donne l'impression d'une page inachevée.
  const aAfficher = (() => {
    const tout = data?.items ?? [];
    if (tout.length >= 8) return tout.slice(0, 8);
    if (tout.length >= 4) return tout.slice(0, 4);
    return tout;
  })();

  // Dans l'ordre de la liste UNIVERS (femme, homme, parfums, déco), pas dans l'ordre alphabétique de l'API.
  const ordre = Object.keys(UNIVERS);
  const univers = (categories?.items ?? [])
    .filter((categorie) => categorie.productCount > 0 && UNIVERS[categorie.slug])
    .sort((a, b) => ordre.indexOf(a.slug) - ordre.indexOf(b.slug));

  return (
    <>
      {/* --- Bannière ---------------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        {/* Halo doré très diffus derrière les photos : de la profondeur sans motif chargé. */}
        <div
          className="pointer-events-none absolute -right-40 top-0 h-[42rem] w-[42rem] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--gold)) 0%, transparent 65%)" }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-8 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:pb-28 lg:pt-12">
          <div className="max-w-xl animate-fade-up">
            <p className="text-[0.6875rem] uppercase tracking-[0.4em] text-gold">
              Maison de mode · {BOUTIQUE.ville}
            </p>
            <p className="mt-6 font-script text-6xl leading-none text-gold sm:text-8xl">{BOUTIQUE.nom}</p>
            <h1 className="mt-6 font-serif text-4xl leading-[1.1] sm:text-6xl">
              L'élégance africaine, <em className="text-gold">simplement</em>.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/70 sm:text-base">
              Boubous brodés, ensembles, parfums et décoration. Choisissez vos pièces en ligne, la
              commande se conclut en un message WhatsApp.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/collection" className={classesBouton({ variante: "or", taille: "lg" })}>
                Découvrir la collection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={lienWhatsApp(`Bonjour ${BOUTIQUE.nom}, j'aimerais un renseignement.`, BOUTIQUE.numeroWhatsApp)}
                target="_blank"
                rel="noreferrer"
                className={classesBouton({ variante: "contourClair", taille: "lg" })}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Nous écrire
              </a>
            </div>
          </div>

          {/* Trois photos en mosaïque : femme, homme, boubou. On voit d'un coup d'œil l'étendue
              de la boutique, sans carrousel qui défile tout seul. */}
          <div className="relative mx-auto grid w-full max-w-xl animate-fade-in grid-cols-[1.25fr_1fr] gap-3 sm:gap-4 lg:max-w-none">
            <img
              src="/accueil/ensemble-bordeaux.jpg"
              alt="Ensemble chemise et pantalon large bordeaux"
              className="row-span-2 h-full w-full rounded-[var(--radius)] object-cover ring-1 ring-gold/40"
            />
            <img
              src="/accueil/hero-homme.jpg"
              alt="Grand boubou homme brodé vert"
              className="aspect-[4/5] w-full rounded-[var(--radius)] object-cover ring-1 ring-gold/40"
            />
            <img
              src="/accueil/hero-boubou.jpg"
              alt="Boubou violet en dentelle"
              className="aspect-[4/5] w-full rounded-[var(--radius)] object-cover ring-1 ring-gold/40"
            />
          </div>
        </div>

        {/* Bandeau défilant : deux copies du texte pour une boucle sans à-coup. */}
        <div className="relative overflow-hidden border-t border-gold/25 py-4" aria-hidden>
          <div className="flex w-max animate-defilement motion-reduce:animate-none">
            {[0, 1].map((copie) => (
              <div key={copie} className="flex shrink-0 items-center">
                {[...BANDEAU, ...BANDEAU].map((mot, index) => (
                  <span key={`${copie}-${index}`} className="flex items-center">
                    <span className="px-8 font-serif text-lg italic text-primary-foreground/80 sm:text-xl">{mot}</span>
                    <span className="text-gold">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Univers ----------------------------------------------------------------------- */}
      {univers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-8 sm:pt-28">
          <Reveal className="text-center">
            <p className="eyebrow-accent">Nos univers</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
              Trouvez votre <span className="font-script text-5xl text-gold sm:text-6xl">style</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {univers.map((categorie, index) => (
              <Reveal key={categorie.id} delai={index * 0.08}>
                <Link
                  to={`/collection?categorie=${categorie.slug}`}
                  className="group relative block overflow-hidden rounded-[var(--radius)] bg-muted"
                >
                  <img
                    src={UNIVERS[categorie.slug].image}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform [transition-duration:1400ms] group-hover:scale-110"
                    style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground sm:p-6">
                    <p className="font-script text-3xl leading-[0.9] text-gold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-5xl">{categorie.name}</p>
                    <p className="mt-2 hidden text-xs text-primary-foreground/80 sm:block">
                      {UNIVERS[categorie.slug].accroche}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.25em]">
                      {categorie.productCount} pièce{categorie.productCount > 1 ? "s" : ""}
                      <ArrowRight className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* --- Nouveautés -------------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow-accent">La collection</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Pièces du moment</h2>
          </div>
          <Link
            to="/collection"
            className="link-underline inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em]"
          >
            Tout voir
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Reveal>

        <div className="mt-12">
          {isPending ? (
            <SquelettesGrille nombre={4} />
          ) : aAfficher.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
              {aAfficher.map((produit, index) => (
                <Reveal key={produit.id} delai={(index % 4) * 0.08}>
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

      {/* --- Comment commander ------------------------------------------------------------- */}
      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow-accent">Commander</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Une conversation, <span className="font-script text-5xl text-gold sm:text-6xl">pas un formulaire</span>
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Pas de compte à créer ni de carte à saisir : on règle ensemble la livraison et le
              paiement, comme en boutique.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
            {ETAPES.map((etape, index) => (
              <Reveal
                key={etape.titre}
                delai={index * 0.1}
                className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-card p-8 text-center shadow-soft"
              >
                <p className="font-script text-6xl leading-none text-gold">{index + 1}</p>
                <h3 className="mt-4 font-serif text-2xl">{etape.titre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{etape.texte}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link to="/collection" className={classesBouton({ taille: "lg" })}>
              Choisir une pièce
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
