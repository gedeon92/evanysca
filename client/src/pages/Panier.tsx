import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Bouton, classesBouton } from "../components/ui/Bouton";
import { BoutonCommandeWhatsApp } from "../components/WhatsAppOrderButton";
import { usePanier } from "../context/CartContext";
import { formatFcfa, libelleStock } from "../lib/utils";
import type { CoordonneesClient } from "../lib/whatsapp";

export function Panier() {
  const { articles, nombre, total, definirQuantite, retirer, vider, revalider, revalidationEnCours } = usePanier();

  const [coordonnees, setCoordonnees] = useState<CoordonneesClient>({ nom: "", ville: "", telephone: "", note: "" });
  const [commandeEnvoyee, setCommandeEnvoyee] = useState(false);

  // Revalidation à l'arrivée sur la page : le panier a pu dormir des semaines pendant que les
  // prix changeaient et que des pièces partaient.
  useEffect(() => {
    let annule = false;

    revalider().then((corrections) => {
      if (annule) return;
      for (const correction of corrections) toast.info(correction.texte);
    });

    return () => {
      annule = true;
    };
    // Volontairement au montage seulement : relancer à chaque changement du panier ferait une
    // requête à chaque clic sur « + ».
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Le contexte porte plus de champs que le message n'en a besoin : on ne transmet que l'utile.
  const lignesMessage = useMemo(
    () =>
      articles.map((article) => ({
        variantId: article.variantId,
        name: article.name,
        color: article.color,
        price: article.price,
        qty: article.qty,
      })),
    [articles],
  );

  const surCommande = () => {
    setCommandeEnvoyee(true);
    // Le panier n'est surtout pas vidé : rien n'est confirmé tant que la conversation n'a pas eu
    // lieu, et un panier effacé d'office serait impossible à retrouver.
    toast.success("Commande envoyée sur WhatsApp", {
      description: "Ton panier reste disponible tant que tu ne le vides pas.",
      duration: 8000,
    });
  };

  if (articles.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="eyebrow-accent">Panier</p>
        <h1 className="mt-6 font-serif text-4xl">Ton panier est vide</h1>
        <div className="rule-fade my-8 w-32" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Parcours la collection et ajoute les pièces qui te plaisent. Tu enverras le tout sur
          WhatsApp en une seule fois.
        </p>
        <Link to="/collection" className={classesBouton({ className: "mt-10" })}>
          Voir la collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
      <header>
        <p className="eyebrow-accent">Panier</p>
        <h1 className="mt-4 font-serif text-5xl">
          <span className="chiffres">{nombre}</span> article{nombre > 1 ? "s" : ""}
        </h1>
        {revalidationEnCours && (
          <p className="mt-4 text-xs text-muted-foreground">Vérification de la disponibilité…</p>
        )}
      </header>

      <div className="rule-fade my-10" />

      <div className="grid items-start gap-12 lg:grid-cols-[1fr_24rem]">
        {/* --- Lignes ------------------------------------------------------------------- */}
        <ul className="space-y-8">
          {articles.map((article) => {
            const alerte = libelleStock(article.stock);

            return (
              <li key={article.variantId} className="flex gap-5">
                <Link to={`/produit/${article.productSlug}`} className="shrink-0">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt=""
                      loading="lazy"
                      className="h-32 w-24 rounded-2xl object-cover sm:h-40 sm:w-32"
                    />
                  ) : (
                    <div className="h-32 w-24 rounded-2xl bg-muted sm:h-40 sm:w-32" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link to={`/produit/${article.productSlug}`} className="link-underline font-serif text-xl">
                          {article.name}
                        </Link>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {article.color}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => retirer(article.variantId)}
                        className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        aria-label={`Retirer ${article.name} du panier`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {alerte && <p className="mt-2 text-xs text-accent">{alerte}</p>}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 rounded-full border border-border p-1">
                      <button
                        type="button"
                        onClick={() => definirQuantite(article.variantId, article.qty - 1)}
                        disabled={article.qty <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{article.qty}</span>
                      <button
                        type="button"
                        onClick={() => definirQuantite(article.variantId, article.qty + 1)}
                        disabled={article.qty >= article.stock}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <p className="text-sm">{formatFcfa(article.price * article.qty)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* --- Récapitulatif et commande ------------------------------------------------ */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[calc(var(--radius)*0.66)] border border-border bg-card p-6 shadow-soft sm:p-8">
            <h2 className="font-serif text-2xl">Ta commande</h2>

            <div className="mt-6 flex items-baseline justify-between border-t border-border pt-6">
              <span className="eyebrow">Total</span>
              <span className="chiffres font-serif text-3xl">{formatFcfa(total)}</span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              La livraison se convient directement dans la conversation, selon ton quartier.
            </p>

            <div className="rule-fade my-8" />

            <div className="space-y-4">
              <p className="eyebrow">Tes coordonnées — facultatif</p>

              <input
                value={coordonnees.nom}
                onChange={(e) => setCoordonnees({ ...coordonnees, nom: e.target.value })}
                placeholder="Nom"
                aria-label="Nom"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <input
                value={coordonnees.ville}
                onChange={(e) => setCoordonnees({ ...coordonnees, ville: e.target.value })}
                placeholder="Ville ou quartier"
                aria-label="Ville ou quartier"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <input
                value={coordonnees.telephone}
                onChange={(e) => setCoordonnees({ ...coordonnees, telephone: e.target.value })}
                placeholder="Téléphone"
                aria-label="Téléphone"
                inputMode="tel"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <textarea
                value={coordonnees.note}
                onChange={(e) => setCoordonnees({ ...coordonnees, note: e.target.value })}
                placeholder="Une précision ?"
                aria-label="Note"
                rows={3}
                className="w-full resize-y rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <BoutonCommandeWhatsApp
              articles={lignesMessage}
              coordonnees={coordonnees}
              onCommande={surCommande}
              className="mt-8"
            />

            {commandeEnvoyee && (
              <Bouton
                variante="discret"
                taille="sm"
                className="mt-4 w-full"
                onClick={() => {
                  vider();
                  setCommandeEnvoyee(false);
                  toast.success("Panier vidé.");
                }}
              >
                Vider le panier
              </Bouton>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
