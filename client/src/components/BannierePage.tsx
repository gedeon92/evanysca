import type { ReactNode } from "react";
import { Ornement } from "./Ornement";

// Bandeau sombre en tête des pages secondaires (contact, questions) : même langage que la
// bannière de l'accueil, avec une photo en fond très estompée pour la profondeur.
export function BannierePage({
  surtitre,
  titre,
  motCalligraphie,
  texte,
  photo,
}: {
  surtitre: string;
  titre: string;
  motCalligraphie: string;
  texte?: ReactNode;
  photo?: string;
}) {
  return (
    <section className="grain relative overflow-hidden bg-primary text-primary-foreground">
      {photo && (
        <img
          src={photo}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20 animate-zoom-lent motion-reduce:animate-none"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/40 via-primary/70 to-primary" aria-hidden />

      <div className="mx-auto max-w-3xl animate-fade-up px-4 pb-20 pt-12 text-center sm:px-8 sm:pb-24 sm:pt-16">
        <p className="text-[0.6875rem] uppercase tracking-[0.4em] text-gold">{surtitre}</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
          {titre} <span className="font-script text-5xl text-gold sm:text-7xl">{motCalligraphie}</span>
        </h1>
        <Ornement className="mt-6" />
        {texte && <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-primary-foreground/70">{texte}</p>}
      </div>
    </section>
  );
}
