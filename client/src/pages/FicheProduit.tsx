import * as Accordion from "@radix-ui/react-accordion";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { chargerProduit } from "../api/catalogue";
import { Reveal } from "../components/Reveal";
import { BoutonArticleWhatsApp } from "../components/WhatsAppOrderButton";
import { Bouton, classesBouton } from "../components/ui/Bouton";
import { SqueletteFiche } from "../components/ui/Skeleton";
import { usePanier } from "../context/CartContext";
import { ApiError } from "../lib/api";
import { cn, formatFcfa, libelleStock, plafonnerQuantite } from "../lib/utils";

export function FicheProduit() {
  const { slug } = useParams<{ slug: string }>();
  const { ajouter } = usePanier();

  const { data: produit, isPending, error } = useQuery({
    queryKey: ["produit", slug],
    queryFn: () => chargerProduit(slug as string),
    enabled: Boolean(slug),
  });

  const [idTeinte, setIdTeinte] = useState<string | null>(null);
  const [indexImage, setIndexImage] = useState(0);
  const [quantite, setQuantite] = useState(1);

  // Première teinte encore disponible sélectionnée par défaut : ouvrir sur une teinte épuisée
  // donnerait l'impression que tout le produit l'est.
  useEffect(() => {
    if (!produit) return;
    const premiereDisponible = produit.variants.find((teinte) => !teinte.isSoldOut) ?? produit.variants[0];
    setIdTeinte(premiereDisponible?.id ?? null);
    setIndexImage(0);
    setQuantite(1);
  }, [produit]);

  const teinte = useMemo(
    () => produit?.variants.find((element) => element.id === idTeinte) ?? produit?.variants[0] ?? null,
    [produit, idTeinte],
  );

  const sections = useMemo(
    () =>
      produit
        ? [
            { cle: "detail", titre: "Détails", texte: produit.detail },
            { cle: "story", titre: "Histoire", texte: produit.story },
            { cle: "designIntent", titre: "Intention de design", texte: produit.designIntent },
            { cle: "materials", titre: "Matières", texte: produit.materials },
            { cle: "craftsmanship", titre: "Savoir-faire", texte: produit.craftsmanship },
            { cle: "care", titre: "Entretien", texte: produit.care },
          ]
        : [],
    [produit],
  );

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <SqueletteFiche />
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="eyebrow-accent">Introuvable</p>
        <h1 className="mt-6 font-serif text-4xl">Cette pièce n'est plus disponible</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {error instanceof ApiError ? error.message : "Elle a peut-être été retirée de la collection."}
        </p>
        <Link to="/collection" className={classesBouton({ className: "mt-10" })}>
          Voir la collection
        </Link>
      </div>
    );
  }

  const images = teinte?.images ?? [];
  const imageActive = images[Math.min(indexImage, images.length - 1)] ?? null;
  const alerte = produit.isSoldOut ? "Épuisé" : teinte ? libelleStock(teinte.stock) : null;
  const indisponible = produit.isSoldOut || !teinte || teinte.isSoldOut;

  const surAjout = () => {
    if (!teinte || teinte.isSoldOut) return;

    ajouter(
      {
        variantId: teinte.id,
        name: produit.name,
        color: teinte.colorName,
        price: produit.price,
        productSlug: produit.slug,
        image: images[0]?.url ?? null,
        stock: teinte.stock,
      },
      quantite,
    );

    toast.success("Ajouté au panier", { description: `${produit.name} — ${teinte.colorName}` });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
      <nav className="mb-10 text-xs text-muted-foreground" aria-label="Fil d'Ariane">
        <Link to="/collection" className="link-underline">
          Collection
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/collection?categorie=${produit.category.slug}`} className="link-underline">
          {produit.category.name}
        </Link>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* --- Galerie ------------------------------------------------------------------ */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[calc(var(--radius)*0.66)] bg-muted">
            {imageActive ? (
              <img
                src={imageActive.url}
                alt={`${produit.name} — ${teinte?.colorName ?? ""}`}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center">
                <span className="eyebrow">Visuel à venir</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setIndexImage(index)}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-colors",
                    index === indexImage ? "border-foreground" : "border-transparent hover:border-border",
                  )}
                  aria-label={`Voir la photo ${index + 1}`}
                >
                  <img src={image.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Informations ------------------------------------------------------------- */}
        <div className="lg:py-4">
          <p className="eyebrow">{produit.line}</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{produit.name}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <p className="text-lg">{formatFcfa(produit.price)}</p>
            {alerte && (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[0.5625rem] uppercase tracking-[0.25em]",
                  produit.isSoldOut || teinte?.isSoldOut
                    ? "bg-foreground/80 text-background"
                    : "bg-accent/15 text-accent",
                )}
              >
                {alerte}
              </span>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{produit.shortDescription}</p>

          <div className="rule-fade my-10" />

          {/* --- Teintes ---------------------------------------------------------------- */}
          {produit.variants.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <p className="eyebrow">Teinte</p>
                <p className="text-sm">{teinte?.colorName}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {produit.variants.map((element) => (
                  <button
                    key={element.id}
                    type="button"
                    onClick={() => {
                      setIdTeinte(element.id);
                      setIndexImage(0);
                      setQuantite(1);
                    }}
                    title={element.colorName}
                    aria-label={`Teinte ${element.colorName}${element.isSoldOut ? " (épuisée)" : ""}`}
                    aria-pressed={element.id === teinte?.id}
                    className={cn(
                      "relative h-10 w-10 rounded-full border-2 transition-all duration-300",
                      element.id === teinte?.id ? "border-foreground" : "border-transparent hover:border-border",
                    )}
                  >
                    <span
                      className="absolute inset-1 rounded-full border border-border"
                      style={{ backgroundColor: element.swatchHex }}
                    />
                    {/* Une teinte épuisée reste sélectionnable : on doit pouvoir la voir, pas la commander. */}
                    {element.isSoldOut && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-px w-8 rotate-45 bg-foreground/60" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- Quantité et ajout ------------------------------------------------------ */}
          <div className="mt-10 space-y-4">
            {!indisponible && teinte && (
              <div className="flex items-center gap-4">
                <p className="eyebrow">Quantité</p>
                <div className="flex items-center gap-1 rounded-full border border-border p-1">
                  <button
                    type="button"
                    onClick={() => setQuantite((valeur) => plafonnerQuantite(valeur - 1, teinte.stock))}
                    disabled={quantite <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{quantite}</span>
                  <button
                    type="button"
                    onClick={() => setQuantite((valeur) => plafonnerQuantite(valeur + 1, teinte.stock))}
                    disabled={quantite >= teinte.stock}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <Bouton taille="lg" className="w-full" onClick={surAjout} disabled={indisponible}>
              <ShoppingBag className="h-4 w-4" aria-hidden />
              {indisponible ? "Épuisé" : "Ajouter au panier"}
            </Bouton>

            {teinte && (
              <BoutonArticleWhatsApp
                article={{ name: produit.name, color: teinte.colorName, price: produit.price }}
                desactive={indisponible}
                className="w-full"
              />
            )}

            {indisponible && (
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Cette pièce n'est plus disponible. Écris-nous sur WhatsApp : certaines sont refaites
                sur demande.
              </p>
            )}
          </div>

          {/* --- Accordéon -------------------------------------------------------------- */}
          <Accordion.Root type="single" collapsible className="mt-12 border-t border-border">
            {sections.map((section) => (
              <Accordion.Item key={section.cle} value={section.cle} className="border-b border-border">
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left">
                    <span className="text-[0.6875rem] uppercase tracking-[0.25em]">{section.titre}</span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500 group-data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <p className="whitespace-pre-line pb-6 text-sm leading-relaxed text-muted-foreground">
                    {section.texte}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>

      <Reveal className="mt-24 text-center">
        <Link to="/collection" className="link-underline text-xs uppercase tracking-[0.25em]">
          Retour à la collection
        </Link>
      </Reveal>
    </div>
  );
}
