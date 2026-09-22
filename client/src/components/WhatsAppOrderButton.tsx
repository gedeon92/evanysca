import { MessageCircle } from "lucide-react";
import { useMemo } from "react";
import { BOUTIQUE, numeroWhatsAppValide } from "../lib/boutique";
import { cn } from "../lib/utils";
import { lienArticleUnique, lienCommande, type CoordonneesClient, type LignePanier } from "../lib/whatsapp";
import { LienBouton, classesBouton } from "./ui/Bouton";

// Un seul principe dans tout ce fichier : le bouton est TOUJOURS un vrai <a href>, dont l'URL est
// calculée en amont. Un onClick qui construirait le lien après un await perdrait le lien avec le
// geste de l'utilisatrice, et Safari sur iPhone bloquerait l'ouverture de l'onglet.

const ATTRIBUTS_LIEN = { target: "_blank", rel: "noopener noreferrer" } as const;

export function BoutonCommandeWhatsApp({
  articles,
  coordonnees,
  desactive,
  onCommande,
  className,
}: {
  articles: LignePanier[];
  coordonnees: CoordonneesClient;
  desactive?: boolean;
  onCommande?: () => void;
  className?: string;
}) {
  const commande = useMemo(
    () => lienCommande(articles, coordonnees, BOUTIQUE.numeroWhatsApp),
    [articles, coordonnees],
  );

  const numeroInvalide = !numeroWhatsAppValide();
  const bloque = desactive || articles.length === 0 || numeroInvalide;

  if (bloque) {
    return (
      <div className={className}>
        <button type="button" disabled className={classesBouton({ variante: "whatsapp", taille: "lg", className: "w-full" })}>
          <MessageCircle className="h-4 w-4" aria-hidden />
          Commander sur WhatsApp
        </button>
        {numeroInvalide && (
          <p className="mt-3 text-center text-xs text-destructive">
            Le numéro WhatsApp de la boutique n'est pas configuré.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <LienBouton
        href={commande.href}
        {...ATTRIBUTS_LIEN}
        variante="whatsapp"
        taille="lg"
        className="w-full"
        // Le panier n'est pas vidé : la commande n'est confirmée que dans la conversation.
        onClick={onCommande}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Commander sur WhatsApp
      </LienBouton>

      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
        WhatsApp s'ouvre avec ta commande déjà rédigée. Tu n'as plus qu'à l'envoyer.
      </p>
    </div>
  );
}

export function BoutonArticleWhatsApp({
  article,
  desactive,
  className,
}: {
  article: { name: string; color: string; price: number };
  desactive?: boolean;
  className?: string;
}) {
  const href = useMemo(() => lienArticleUnique(article, BOUTIQUE.numeroWhatsApp), [article]);

  if (desactive || !numeroWhatsAppValide()) {
    return (
      <button type="button" disabled className={classesBouton({ variante: "contour", className })}>
        <MessageCircle className="h-4 w-4" aria-hidden />
        Commander cet article
      </button>
    );
  }

  return (
    <LienBouton href={href} {...ATTRIBUTS_LIEN} variante="contour" className={className}>
      <MessageCircle className="h-4 w-4" aria-hidden />
      Commander cet article
    </LienBouton>
  );
}

// Présent sur tout le site : c'est le moyen de contact principal de la boutique, il ne doit
// jamais être à plus d'un geste.
export function BoutonWhatsAppFlottant() {
  const href = useMemo(
    () =>
      `https://wa.me/${BOUTIQUE.numeroWhatsApp}?text=${encodeURIComponent(
        `Bonjour ${BOUTIQUE.nom}, j'aimerais avoir des renseignements.`,
      )}`,
    [],
  );

  if (!numeroWhatsAppValide()) return null;

  return (
    <a
      href={href}
      {...ATTRIBUTS_LIEN}
      aria-label="Contacter la boutique sur WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full",
        "bg-[#25D366] text-white shadow-card transition-transform duration-500 hover:scale-105",
        // Remonté au-dessus de la barre d'action du panier sur mobile, sinon il la recouvre.
        "max-sm:bottom-24",
      )}
    >
      <MessageCircle className="h-6 w-6" aria-hidden />
    </a>
  );
}
