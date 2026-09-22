import { Link } from "react-router-dom";

export function NonTrouvee() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="eyebrow-accent">Erreur 404</p>
      <h1 className="mt-4 font-serif text-4xl">Cette page n'existe pas</h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Le lien est peut-être obsolète, ou la page a été déplacée.
      </p>
      <Link to="/" className="link-underline mt-8 text-sm uppercase tracking-[0.2em]">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
