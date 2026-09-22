import { Link } from "react-router-dom";
import { classesBouton } from "../components/ui/Bouton";

export function NonTrouvee() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow-accent">Erreur 404</p>
      <h1 className="mt-6 font-serif text-5xl">Page introuvable</h1>
      <div className="rule-fade my-8 w-32" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        Cette page n'existe pas, ou la pièce que tu cherchais n'est plus en ligne.
      </p>
      <Link to="/collection" className={classesBouton({ className: "mt-10" })}>
        Voir la collection
      </Link>
    </div>
  );
}
