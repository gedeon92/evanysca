import { Reveal } from "../components/Reveal";
import { BOUTIQUE } from "../lib/boutique";

const ETAPES = [
  {
    titre: "Tu composes ton panier",
    texte: "Aucun compte à créer, aucune carte à saisir. Le panier reste dans ton navigateur.",
  },
  {
    titre: "Ta commande part sur WhatsApp",
    texte: "Elle s'ouvre déjà rédigée : les pièces, les teintes, les quantités et le total.",
  },
  {
    titre: "On confirme ensemble",
    texte:
      "Disponibilité, lieu de livraison, délai et mode de paiement se règlent dans la conversation.",
  },
  {
    titre: "Tu reçois ta commande",
    texte: `Livraison à ${BOUTIQUE.ville} et en région, ou retrait sur rendez-vous.`,
  },
];

export function Livraison() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <p className="eyebrow-accent">Informations</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">Commande et livraison</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Le fonctionnement est volontairement simple, et tient en quatre étapes.
        </p>
      </Reveal>

      <div className="rule-fade my-12" />

      <ol className="space-y-12">
        {ETAPES.map((etape, index) => (
          <Reveal key={etape.titre} delai={index * 0.08}>
            <li className="flex gap-6">
              <span className="font-serif text-4xl leading-none text-accent/30">0{index + 1}</span>
              <div>
                <h2 className="font-serif text-2xl">{etape.titre}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{etape.texte}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-16 rounded-[calc(var(--radius)*0.66)] border border-border bg-card p-8 shadow-soft">
        <p className="eyebrow">À savoir</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Les frais de livraison dépendent du quartier et sont annoncés dans la conversation, avant
          tout règlement. Rien n'est prélevé sur ce site : aucun paiement n'y transite.
        </p>
      </Reveal>
    </div>
  );
}
