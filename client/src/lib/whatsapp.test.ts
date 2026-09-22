import { describe, expect, it } from "vitest";
import { libelleStock, formatFcfa, plafonnerQuantite } from "./utils";
import {
  LIMITE_URL,
  construireMessage,
  lienArticleUnique,
  lienCommande,
  nombreArticles,
  sousTotal,
  type LignePanier,
} from "./whatsapp";

const NUMERO = "221770000000";

const ligne = (surcharge: Partial<LignePanier> = {}): LignePanier => ({
  variantId: "v1",
  name: "Sac Ambre",
  color: "Noisette",
  price: 165000,
  qty: 1,
  ...surcharge,
});

describe("formatFcfa", () => {
  it("sépare les milliers par des espaces ordinaires et inclut le suffixe", () => {
    expect(formatFcfa(165000)).toBe("165 000 FCFA");
    expect(formatFcfa(1250000)).toBe("1 250 000 FCFA");
    expect(formatFcfa(0)).toBe("0 FCFA");
  });

  it("n'introduit pas d'espace insécable, qui s'afficherait mal dans WhatsApp", () => {
    expect(formatFcfa(165000)).not.toMatch(/ | /);
  });
});

describe("totaux", () => {
  it("multiplie chaque ligne par sa quantité", () => {
    const panier = [ligne({ qty: 2 }), ligne({ variantId: "v2", price: 45000, qty: 3 })];
    expect(sousTotal(panier)).toBe(165000 * 2 + 45000 * 3);
    expect(nombreArticles(panier)).toBe(5);
  });

  it("rend 0 sur un panier vide plutôt que NaN", () => {
    expect(sousTotal([])).toBe(0);
    expect(nombreArticles([])).toBe(0);
  });
});

describe("construireMessage", () => {
  it("numérote les lignes et affiche le total", () => {
    const message = construireMessage([ligne({ qty: 2 }), ligne({ variantId: "v2", name: "Collier Lune", color: "Or", price: 45000 })]);

    expect(message).toContain("1. Sac Ambre — Noisette");
    expect(message).toContain("Quantité : 2 — 330 000 FCFA");
    expect(message).toContain("2. Collier Lune — Or");
    expect(message).toContain("Total : 375 000 FCFA");
  });

  it("n'ajoute aucune ligne de coordonnées quand le formulaire est laissé vide", () => {
    const message = construireMessage([ligne()], {});
    expect(message).not.toContain("Nom :");
    expect(message).not.toContain("Ville");
    expect(message).not.toContain("Téléphone");
  });

  it("n'ajoute que les coordonnées réellement renseignées", () => {
    const message = construireMessage([ligne()], { nom: "  Awa  ", ville: "", telephone: "770000000" });

    expect(message).toContain("Nom : Awa");
    expect(message).toContain("Téléphone : 770000000");
    expect(message).not.toContain("Ville / quartier :");
  });

  it("n'inclut la note que si elle existe", () => {
    expect(construireMessage([ligne()], { note: "Livraison samedi" })).toContain("Note : Livraison samedi");
    expect(construireMessage([ligne()], { note: "   " })).not.toContain("Note :");
  });

  it("produit un format compact nettement plus court", () => {
    const panier = [ligne({ qty: 2 })];
    const lisible = construireMessage(panier, {}, "lisible");
    const compact = construireMessage(panier, {}, "compact");

    expect(compact).toContain("2× Sac Ambre / Noisette — 330 000 FCFA");
    expect(compact.length).toBeLessThan(lisible.length);
  });
});

describe("lienCommande", () => {
  it("garde le format lisible sur un panier ordinaire", () => {
    const commande = lienCommande([ligne(), ligne({ variantId: "v2" })], { nom: "Awa" }, NUMERO);

    expect(commande.format).toBe("lisible");
    expect(commande.href.startsWith(`https://wa.me/${NUMERO}?text=`)).toBe(true);
    expect(commande.longueurUrl).toBeLessThanOrEqual(LIMITE_URL);
  });

  it("bascule en format compact quand l'URL dépasserait la limite", () => {
    // Vingt lignes à noms longs : exactement le panier qui faisait tronquer le message.
    const gros = Array.from({ length: 20 }, (_, index) =>
      ligne({
        variantId: `v${index}`,
        name: `Sac Cabas Éditorial Numéro ${index} en cuir pleine fleur`,
        color: "Noisette Profond Chiné",
        qty: 2,
      }),
    );

    const commande = lienCommande(gros, { nom: "Awa", ville: "Sacré-Cœur", telephone: "770000000" }, NUMERO);

    expect(commande.format).toBe("compact");
    expect(commande.message).toContain("2× Sac Cabas");
  });

  it("conserve le total exact même en format compact", () => {
    const gros = Array.from({ length: 30 }, (_, index) =>
      ligne({ variantId: `v${index}`, name: `Pièce éditoriale numéro ${index} très longuement nommée`, qty: 3 }),
    );

    const commande = lienCommande(gros, {}, NUMERO);
    expect(commande.format).toBe("compact");
    expect(commande.message).toContain(`Total : ${formatFcfa(165000 * 3 * 30)}`);
  });

  it("échappe les caractères spéciaux : le message doit survivre à l'aller-retour", () => {
    const commande = lienCommande(
      [ligne({ name: "Sac « Été » 100% cuir", color: "Bleu & Or" })],
      { note: "Adresse : 12 rue de l'Église #3 ?" },
      NUMERO,
    );

    const texteEncode = commande.href.split("?text=")[1];
    expect(decodeURIComponent(texteEncode)).toBe(commande.message);
    // Ni « & » ni « # » ne doivent rester bruts : ils couperaient l'URL en deux.
    expect(texteEncode).not.toContain("&");
    expect(texteEncode).not.toContain("#");
    expect(texteEncode).not.toContain(" ");
  });

  it("encode aussi les retours à la ligne", () => {
    const commande = lienCommande([ligne()], {}, NUMERO);
    expect(commande.href).toContain("%0A");
    expect(commande.href).not.toContain("\n");
  });
});

describe("lienArticleUnique", () => {
  it("prépare un message pour un seul article, sans total ni coordonnées", () => {
    const lien = lienArticleUnique({ name: "Collier Lune", color: "Or", price: 45000 }, NUMERO);
    const message = decodeURIComponent(lien.split("?text=")[1]);

    expect(message).toContain("Collier Lune — Or");
    expect(message).toContain("Prix : 45 000 FCFA");
    expect(message).not.toContain("Total :");
  });
});

describe("règles de stock", () => {
  it("n'affiche rien tant que le stock est confortable", () => {
    expect(libelleStock(10)).toBeNull();
    expect(libelleStock(4)).toBeNull();
  });

  it("prévient sur les derniers exemplaires, au singulier comme au pluriel", () => {
    expect(libelleStock(3)).toBe("Dernières pièces");
    expect(libelleStock(1)).toBe("Dernière pièce");
  });

  it("signale l'épuisement, y compris sur un stock négatif issu d'une saisie erronée", () => {
    expect(libelleStock(0)).toBe("Épuisé");
    expect(libelleStock(-2)).toBe("Épuisé");
  });
});

describe("plafonnerQuantite", () => {
  it("ne descend jamais sous 1", () => {
    expect(plafonnerQuantite(0, 10)).toBe(1);
    expect(plafonnerQuantite(-5, 10)).toBe(1);
  });

  it("plafonne au stock disponible", () => {
    expect(plafonnerQuantite(9, 4)).toBe(4);
    expect(plafonnerQuantite(4, 4)).toBe(4);
  });

  it("résiste aux valeurs aberrantes venues du localStorage", () => {
    expect(plafonnerQuantite(Number.NaN, 5)).toBe(1);
    expect(plafonnerQuantite(2.7, 5)).toBe(2);
  });
});
