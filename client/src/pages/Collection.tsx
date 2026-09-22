import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { listerCategories, listerProduits } from "../api/catalogue";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
import { classesBouton } from "../components/ui/Bouton";
import { SquelettesGrille } from "../components/ui/Skeleton";
import { cn } from "../lib/utils";

const PAR_PAGE = 12;

export function Collection() {
  // Les filtres vivent dans l'URL : une grille filtrée se partage par lien et survit au bouton
  // Précédent, ce qu'un état local ne permettrait pas.
  const [parametres, setParametres] = useSearchParams();
  const categorieActive = parametres.get("categorie") ?? "";
  const page = Math.max(1, Number(parametres.get("page") ?? 1));

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  const { data, isPending } = useQuery({
    queryKey: ["produits", "collection", categorieActive, page],
    queryFn: () => listerProduits({ category: categorieActive, page, limit: PAR_PAGE }),
    placeholderData: keepPreviousData,
  });

  const changerCategorie = (slug: string) => {
    const suivants = new URLSearchParams(parametres);
    if (slug) suivants.set("categorie", slug);
    else suivants.delete("categorie");
    // Changer de filtre remet à la première page : rester en page 3 afficherait un vide.
    suivants.delete("page");
    setParametres(suivants);
  };

  const changerPage = (suivante: number) => {
    const suivants = new URLSearchParams(parametres);
    if (suivante > 1) suivants.set("page", String(suivante));
    else suivants.delete("page");
    setParametres(suivants);
  };

  // Une catégorie sans aucune pièce en ligne ne sert qu'à mener vers une grille vide.
  const categoriesAffichables = categories?.items.filter((categorie) => categorie.productCount > 0) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
      <header className="max-w-2xl">
        <p className="eyebrow-accent">La collection</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">Toutes les pièces</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Chaque teinte est produite en très petite quantité. Ce qui est affiché est ce qui reste.
        </p>
      </header>

      {categoriesAffichables.length > 0 && (
        <nav className="mt-12 flex flex-wrap gap-3" aria-label="Filtrer par catégorie">
          <button
            type="button"
            onClick={() => changerCategorie("")}
            className={cn(
              "rounded-full border px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.2em] transition-colors",
              categorieActive === ""
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/40",
            )}
          >
            Tout
          </button>

          {categoriesAffichables.map((categorie) => (
            <button
              key={categorie.id}
              type="button"
              onClick={() => changerCategorie(categorie.slug)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.2em] transition-colors",
                categorieActive === categorie.slug
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40",
              )}
            >
              {categorie.name}
            </button>
          ))}
        </nav>
      )}

      <div className="rule-fade my-12" />

      {isPending ? (
        <SquelettesGrille nombre={6} />
      ) : !data?.items.length ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl">Rien à afficher ici</p>
          <p className="mt-4 text-sm text-muted-foreground">
            {categorieActive
              ? "Cette catégorie ne contient aucune pièce pour le moment."
              : "La collection sera dévoilée très prochainement."}
          </p>
          {categorieActive && (
            <button type="button" onClick={() => changerCategorie("")} className={classesBouton({ className: "mt-10" })}>
              Voir toute la collection
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((produit, index) => (
              <Reveal key={produit.id} delai={Math.min(index, 5) * 0.06}>
                <ProductCard produit={produit} />
              </Reveal>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-20 flex items-center justify-center gap-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => changerPage(page - 1)}
                className={classesBouton({ variante: "contour", taille: "sm" })}
              >
                Précédent
              </button>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {page} / {data.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => changerPage(page + 1)}
                className={classesBouton({ variante: "contour", taille: "sm" })}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
