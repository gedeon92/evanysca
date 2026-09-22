import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { classesBouton } from "../components/ui/Bouton";
import { BOUTIQUE } from "../lib/boutique";

export function NotreHistoire() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <p className="eyebrow-accent">La maison</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">Notre histoire</h1>
      </Reveal>

      <div className="rule-fade my-12" />

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Reveal>
          <p className="font-serif text-2xl leading-relaxed text-foreground">
            {BOUTIQUE.nom} est née d'un refus : celui de produire beaucoup pour vendre vite.
          </p>
        </Reveal>

        <Reveal delai={0.05}>
          <p>
            Tout a commencé par quelques pièces, faites pour soi puis pour des proches. La demande
            est venue d'elle-même, par le bouche-à-oreille, bien avant qu'il y ait un site.
          </p>
        </Reveal>

        <Reveal delai={0.1}>
          <p>
            Nous avons gardé cette façon de faire. Les matières sont achetées en petite quantité,
            les pièces sont façonnées à la main, et chaque teinte n'existe qu'en quelques
            exemplaires. Quand une série est terminée, elle ne revient pas toujours.
          </p>
        </Reveal>

        <Reveal delai={0.15}>
          <p>
            C'est aussi pourquoi les commandes passent par WhatsApp plutôt que par un tunnel de
            paiement. Une conversation permet de vérifier une disponibilité, d'ajuster une teinte,
            de convenir d'une livraison. Un formulaire ne sait pas faire cela.
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-16">
        <Link to="/collection" className={classesBouton({})}>
          Voir la collection
        </Link>
      </Reveal>
    </div>
  );
}
