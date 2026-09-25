import { Link } from "react-router-dom";
import type { ProduitVignette } from "../api/types";
import { formatFcfa, libelleStock } from "../lib/utils";

export function ProductCard({ produit }: { produit: ProduitVignette }) {
  const alerteStock = produit.isSoldOut ? "Épuisé" : libelleStock(produit.totalStock);

  return (
    <Link to={`/produit/${produit.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[calc(var(--radius)*0.66)] bg-muted">
        {produit.image ? (
          <img
            src={produit.image}
            alt={produit.name}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform [transition-duration:1200ms] group-hover:scale-105"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
        ) : (
          <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 border border-dashed border-border">
            <span className="h-8 w-8 rounded-full border border-border" aria-hidden />
            <span className="eyebrow">Photo à venir</span>
          </div>
        )}

        {produit.tag && !produit.isSoldOut && (
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-[0.5625rem] uppercase tracking-[0.25em] backdrop-blur">
            {produit.tag}
          </span>
        )}

        {alerteStock && (
          <span
            className={
              produit.isSoldOut
                ? "absolute right-4 top-4 rounded-full bg-foreground/80 px-3 py-1.5 text-[0.5625rem] uppercase tracking-[0.25em] text-background backdrop-blur"
                : "absolute right-4 top-4 rounded-full bg-accent/90 px-3 py-1.5 text-[0.5625rem] uppercase tracking-[0.25em] text-accent-foreground backdrop-blur"
            }
          >
            {alerteStock}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-2">
        <p className="eyebrow">{produit.line}</p>
        <h3 className="font-serif text-xl leading-snug">{produit.name}</h3>

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-sm text-muted-foreground">{formatFcfa(produit.price)}</p>

          {produit.swatches.length > 0 && (
            <div className="flex items-center gap-1.5" aria-label={`${produit.swatches.length} teintes disponibles`}>
              {produit.swatches.slice(0, 4).map((pastille) => (
                <span
                  key={pastille.colorName}
                  title={pastille.colorName}
                  className="h-3 w-3 rounded-full border border-border"
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
