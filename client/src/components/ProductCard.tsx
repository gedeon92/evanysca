import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProduitVignette } from "../api/types";
import { formatFcfa, libelleStock } from "../lib/utils";

export function ProductCard({ produit }: { produit: ProduitVignette }) {
  const alerteStock = produit.isSoldOut ? "Épuisé" : libelleStock(produit.totalStock);

  return (
    <Link to={`/produit/${produit.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[calc(var(--radius)*0.66)] bg-muted shadow-soft transition-shadow duration-700 group-hover:shadow-card">
        {produit.image ? (
          <img
            src={produit.image}
            alt={produit.name}
            loading="lazy"
            className="aspect-[3/4] w-full object-cover transition-transform [transition-duration:1200ms] group-hover:scale-105"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
        ) : (
          <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 border border-dashed border-border">
            <span className="h-8 w-8 rounded-full border border-border" aria-hidden />
            <span className="eyebrow">Photo à venir</span>
          </div>
        )}

        {/* Voile et invitation qui apparaissent au survol, sur ordinateur seulement : sur
            téléphone il n'y a pas de survol, la vignette entière est déjà le lien. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <span className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 translate-y-3 items-center gap-2 whitespace-nowrap rounded-full bg-background/95 px-5 py-2.5 text-[0.625rem] uppercase tracking-[0.25em] opacity-0 shadow-soft transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:inline-flex">
          Voir la pièce
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </span>

        {produit.tag && !produit.isSoldOut && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-primary/85 px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.25em] text-gold backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[0.5625rem]">
            {produit.tag}
          </span>
        )}

        {alerteStock && (
          <span
            className={
              (produit.isSoldOut ? "bg-foreground/80 text-background" : "bg-accent/90 text-accent-foreground") +
              " absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.25em] backdrop-blur sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[0.5625rem]"
            }
          >
            {alerteStock}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1 sm:mt-5 sm:space-y-1.5">
        <p className="hidden text-[0.625rem] uppercase tracking-[0.3em] text-muted-foreground sm:block">{produit.category.name}</p>
        <h3 className="line-clamp-2 font-serif text-lg leading-snug sm:text-xl">{produit.name}</h3>

        <div className="flex items-center justify-between gap-3">
          <p className="chiffres text-sm font-normal text-accent">{formatFcfa(produit.price)}</p>

          {/* Une seule pastille n'apprend rien : elle ne s'affiche que s'il y a un vrai choix. */}
          {produit.swatches.length > 1 && (
            <div className="flex items-center gap-1" aria-label={`${produit.swatches.length} teintes disponibles`}>
              {produit.swatches.slice(0, 4).map((pastille) => (
                <span
                  key={pastille.colorName}
                  title={pastille.colorName}
                  className="h-2.5 w-2.5 rounded-full border border-border sm:h-3 sm:w-3"
                  style={{ backgroundColor: pastille.swatchHex }}
                />
              ))}
              {produit.swatches.length > 4 && (
                <span className="text-[0.625rem] text-muted-foreground">+{produit.swatches.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
