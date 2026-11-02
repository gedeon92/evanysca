import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, Package, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listerCategories } from "../api/categories";
import { listerProduits, type FiltresProduits } from "../api/products";
import { Badge } from "../components/ui/Badge";
import { classesBouton } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Field";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonTableau } from "../components/ui/Skeleton";
import { formatFcfa } from "../lib/utils";

const PAR_PAGE = 20;

export function ListeProduits() {
  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [categorie, setCategorie] = useState("");
  const [statut, setStatut] = useState<FiltresProduits["status"]>("all");
  const [page, setPage] = useState(1);

  // Anti-rebond : sans lui, taper « écharpe » lancerait sept requêtes et la dernière arrivée
  // n'est pas forcément la plus récente.
  useEffect(() => {
    const minuteur = setTimeout(() => {
      setRechercheAppliquee(recherche);
      setPage(1);
    }, 350);
    return () => clearTimeout(minuteur);
  }, [recherche]);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["produits", { rechercheAppliquee, categorie, statut, page }],
    queryFn: () =>
      listerProduits({ search: rechercheAppliquee, category: categorie, status: statut, page, limit: PAR_PAGE }),
    // La page précédente reste affichée pendant le chargement de la suivante : sans ça, la liste
    // disparaît et la page saute à chaque changement de filtre.
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-accent">Catalogue</p>
          <h1 className="mt-3 font-serif text-4xl">Produits</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {data ? `${data.total} fiche${data.total > 1 ? "s" : ""} au total.` : "Chargement…"}
          </p>
        </div>

        <Link to="/produits/nouveau" className={classesBouton({ className: "shrink-0" })}>
          <Plus className="h-4 w-4" aria-hidden />
          Nouveau produit
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par nom, ligne, référence ou SKU"
            className="pl-11"
            aria-label="Rechercher un produit"
          />
        </div>

        <Select
          value={categorie}
          onChange={(e) => {
            setCategorie(e.target.value);
            setPage(1);
          }}
          aria-label="Filtrer par catégorie"
        >
          <option value="">Toutes les catégories</option>
          {categories?.items.map((element) => (
            <option key={element.id} value={element.slug}>
              {element.name}
            </option>
          ))}
        </Select>

        <Select
          value={statut}
          onChange={(e) => {
            setStatut(e.target.value as FiltresProduits["status"]);
            setPage(1);
          }}
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">En ligne</option>
          <option value="inactive">Masqués</option>
        </Select>
      </div>

      {isPending ? (
        <SkeletonTableau lignes={6} />
      ) : !data?.items.length ? (
        <div className="card-soft p-12 text-center">
          <p className="font-serif text-2xl">Aucun produit</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {rechercheAppliquee || categorie || statut !== "all"
              ? "Aucune fiche ne correspond à ces filtres."
              : "Crée ta première fiche produit pour la voir apparaître sur le site."}
          </p>
        </div>
      ) : (
        <ul className={isFetching ? "space-y-3 opacity-60 transition-opacity" : "space-y-3 transition-opacity"}>
          {data.items.map((produit) => (
            <li key={produit.id}>
              <Link
                to={`/produits/${produit.id}`}
                className="card-soft flex items-center gap-4 p-3 transition-shadow hover:shadow-card sm:p-4"
              >
                {produit.image ? (
                  <img src={produit.image} alt="" loading="lazy" className="h-20 w-16 shrink-0 rounded-xl object-cover sm:h-24 sm:w-20" />
                ) : (
                  <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-muted sm:h-24 sm:w-20">
                    <Package className="h-5 w-5 text-muted-foreground" aria-hidden />
                  </div>
                )}

                {/* Sur téléphone, prix et stock passent sous le nom au lieu d'occuper une ligne à
                    part : le nom garde toute la largeur et n'est plus coupé au bout de 15 lettres. */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 leading-snug">{produit.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {produit.category.name} · <span className="font-mono">{produit.ref}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                    <span className="text-sm">{formatFcfa(produit.price)}</span>
                    <EtatProduit produit={produit} />
                  </div>
                </div>

                <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                  <span className="text-sm">{formatFcfa(produit.price)}</span>
                  <EtatProduit produit={produit} />
                </div>

                <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />}
    </div>
  );
}

function EtatProduit({ produit }: { produit: { isActive: boolean; variantCount: number; totalStock: number } }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {!produit.isActive && <Badge ton="neutre">Masqué</Badge>}
      {produit.variantCount === 0 ? (
        <Badge ton="danger">Aucune teinte</Badge>
      ) : produit.totalStock === 0 ? (
        <Badge ton="danger">Épuisé</Badge>
      ) : produit.totalStock <= 3 ? (
        <Badge ton="alerte">Stock {produit.totalStock}</Badge>
      ) : (
        <Badge ton="succes">Stock {produit.totalStock}</Badge>
      )}
    </span>
  );
}
