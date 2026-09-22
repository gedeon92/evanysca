import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { validerPanier } from "../api/catalogue";
import { plafonnerQuantite } from "../lib/utils";
import { nombreArticles, sousTotal, type LignePanier } from "../lib/whatsapp";

const CLE_STOCKAGE = "boutique-panier-v1";

export type ArticlePanier = LignePanier & {
  productSlug: string;
  image: string | null;
  stock: number;
};

type Correction = { texte: string };

type ContextePanier = {
  articles: ArticlePanier[];
  nombre: number;
  total: number;
  ajouter: (article: Omit<ArticlePanier, "qty">, quantite?: number) => void;
  retirer: (variantId: string) => void;
  definirQuantite: (variantId: string, quantite: number) => void;
  vider: () => void;
  revalider: () => Promise<Correction[]>;
  revalidationEnCours: boolean;
};

const Contexte = createContext<ContextePanier | null>(null);

// Le panier vient du navigateur : son contenu peut avoir été modifié à la main, écrit par une
// version précédente du site, ou tout simplement corrompu. On ne fait confiance à rien.
function lireStockage(): ArticlePanier[] {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return [];

    const donnees: unknown = JSON.parse(brut);
    if (!Array.isArray(donnees)) return [];

    return donnees.flatMap((entree): ArticlePanier[] => {
      const article = entree as Partial<ArticlePanier>;
      if (typeof article.variantId !== "string" || typeof article.name !== "string") return [];

      return [
        {
          variantId: article.variantId,
          name: article.name,
          color: typeof article.color === "string" ? article.color : "",
          price: Number.isFinite(article.price) ? Number(article.price) : 0,
          qty: plafonnerQuantite(Number(article.qty), 0),
          productSlug: typeof article.productSlug === "string" ? article.productSlug : "",
          image: typeof article.image === "string" ? article.image : null,
          stock: Number.isFinite(article.stock) ? Number(article.stock) : 0,
        },
      ];
    });
  } catch {
    // Stockage inaccessible (navigation privée, cookies bloqués) : un panier vide vaut mieux
    // qu'une page blanche.
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<ArticlePanier[]>(() => lireStockage());
  const [revalidationEnCours, setRevalidationEnCours] = useState(false);
  const articlesRef = useRef(articles);
  articlesRef.current = articles;

  useEffect(() => {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(articles));
    } catch {
      // Écriture impossible : le panier reste valable pour la session en cours.
    }
  }, [articles]);

  const ajouter = useCallback((article: Omit<ArticlePanier, "qty">, quantite = 1) => {
    setArticles((precedents) => {
      const existant = precedents.find((ligne) => ligne.variantId === article.variantId);

      if (!existant) {
        return [...precedents, { ...article, qty: plafonnerQuantite(quantite, article.stock) }];
      }

      // Deuxième ajout de la même teinte : on cumule, sans jamais dépasser le stock connu.
      return precedents.map((ligne) =>
        ligne.variantId === article.variantId
          ? { ...ligne, ...article, qty: plafonnerQuantite(ligne.qty + quantite, article.stock) }
          : ligne,
      );
    });
  }, []);

  const retirer = useCallback((variantId: string) => {
    setArticles((precedents) => precedents.filter((ligne) => ligne.variantId !== variantId));
  }, []);

  const definirQuantite = useCallback((variantId: string, quantite: number) => {
    setArticles((precedents) =>
      precedents.map((ligne) =>
        ligne.variantId === variantId ? { ...ligne, qty: plafonnerQuantite(quantite, ligne.stock) } : ligne,
      ),
    );
  }, []);

  const vider = useCallback(() => setArticles([]), []);

  // Le panier peut dormir des semaines dans le navigateur pendant que les prix changent, que des
  // teintes disparaissent et que des produits sont retirés. Sans ce recoupement, la commande
  // partirait sur WhatsApp avec un montant que la vendeuse ne pourrait pas honorer.
  const revalider = useCallback(async (): Promise<Correction[]> => {
    const courants = articlesRef.current;
    if (courants.length === 0) return [];

    setRevalidationEnCours(true);

    try {
      const { items } = await validerPanier(courants.map((ligne) => ligne.variantId));
      const parIdentifiant = new Map(items.map((ligne) => [ligne.variantId, ligne]));
      const corrections: Correction[] = [];

      const misAJour = courants.flatMap((article): ArticlePanier[] => {
        const reference = parIdentifiant.get(article.variantId);

        if (!reference || !reference.exists || !reference.isActive) {
          corrections.push({ texte: `« ${article.name} » n'est plus disponible et a été retiré du panier.` });
          return [];
        }

        if (reference.stock <= 0) {
          corrections.push({ texte: `« ${article.name} — ${article.color} » est épuisé et a été retiré du panier.` });
          return [];
        }

        const prix = reference.price ?? article.price;
        const quantite = plafonnerQuantite(article.qty, reference.stock);

        if (prix !== article.price) {
          corrections.push({ texte: `Le prix de « ${article.name} » a changé.` });
        }
        if (quantite !== article.qty) {
          corrections.push({ texte: `Quantité ramenée à ${quantite} pour « ${article.name} » : stock insuffisant.` });
        }

        return [
          {
            ...article,
            name: reference.name ?? article.name,
            color: reference.color ?? article.color,
            productSlug: reference.productSlug ?? article.productSlug,
            image: reference.image ?? article.image,
            price: prix,
            stock: reference.stock,
            qty: quantite,
          },
        ];
      });

      setArticles(misAJour);
      return corrections;
    } catch {
      // API injoignable : on ne touche pas au panier. Le vider sur une coupure réseau serait bien
      // pire que d'afficher des prix peut-être périmés.
      return [];
    } finally {
      setRevalidationEnCours(false);
    }
  }, []);

  const valeur = useMemo<ContextePanier>(
    () => ({
      articles,
      nombre: nombreArticles(articles),
      total: sousTotal(articles),
      ajouter,
      retirer,
      definirQuantite,
      vider,
      revalider,
      revalidationEnCours,
    }),
    [articles, ajouter, retirer, definirQuantite, vider, revalider, revalidationEnCours],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function usePanier(): ContextePanier {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("usePanier doit être utilisé dans un CartProvider.");
  return contexte;
}
