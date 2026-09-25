import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, EyeOff, FolderTree, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { chargerTableauDeBord } from "../api/dashboard";
import { Badge } from "../components/ui/Badge";
import { classesBouton } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { formatDate, formatFcfa } from "../lib/utils";

function Tuile({
  libelle,
  valeur,
  icone: Icone,
  alerte,
}: {
  libelle: string;
  valeur: number;
  icone: typeof Package;
  alerte?: boolean;
}) {
  return (
    <div className="card-soft p-6">
      <div className="flex items-start justify-between">
        <p className="eyebrow">{libelle}</p>
        <Icone className={alerte && valeur > 0 ? "h-4 w-4 text-accent" : "h-4 w-4 text-muted-foreground"} aria-hidden />
      </div>
      <p className="chiffres mt-4 font-serif text-4xl leading-none">{valeur}</p>
    </div>
  );
}

export function TableauDeBord() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["tableau-de-bord"],
    queryFn: chargerTableauDeBord,
  });

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <p className="eyebrow-accent">Vue d'ensemble</p>
        <h1 className="mt-3 font-serif text-4xl">Tableau de bord</h1>
        <div className="rule-fade mt-6 w-32" />
      </header>

      {isError && (
        <div className="card-soft border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : "Impossible de charger le tableau de bord."}
        </div>
      )}

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tuile libelle="Produits" valeur={data.productCount} icone={Package} />
            <Tuile libelle="Catégories" valeur={data.categoryCount} icone={FolderTree} />
            <Tuile libelle="En rupture" valeur={data.outOfStockCount} icone={AlertTriangle} alerte />
            <Tuile libelle="Désactivés" valeur={data.inactiveProductCount} icone={EyeOff} />
          </div>

          {data.outOfStockCount > 0 && (
            <div className="card-soft flex flex-col gap-4 border-accent/30 bg-accent/5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                {data.outOfStockCount} produit{data.outOfStockCount > 1 ? "s sont" : " est"} en rupture. Les clientes
                voient « Épuisé » et ne peuvent pas commander.
              </p>
              <Link to="/produits" className={classesBouton({ variante: "accent", taille: "sm", className: "shrink-0" })}>
                Voir les produits
              </Link>
            </div>
          )}

          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl">Derniers ajouts</h2>
                <p className="mt-1 text-sm text-muted-foreground">Les cinq fiches les plus récentes.</p>
              </div>
              <Link to="/produits" className="link-underline shrink-0 text-xs uppercase tracking-[0.2em]">
                Tout voir
              </Link>
            </div>

            {data.latestProducts.length === 0 ? (
              <div className="card-soft p-10 text-center">
                <p className="text-sm text-muted-foreground">Aucun produit pour le moment.</p>
                <Link to="/produits/nouveau" className={classesBouton({ className: "mt-6" })}>
                  Créer le premier produit
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.latestProducts.map((produit) => (
                  <li key={produit.id}>
                    <Link
                      to={`/produits/${produit.id}`}
                      className="card-soft flex items-center gap-4 p-4 transition-shadow hover:shadow-card"
                    >
                      {produit.image ? (
                        <img
                          src={produit.image}
                          alt=""
                          loading="lazy"
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" aria-hidden />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{produit.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {produit.category.name} — {formatDate(produit.createdAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        {!produit.isActive && <Badge ton="neutre">Masqué</Badge>}
                        <span className="text-sm">{formatFcfa(produit.price)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
