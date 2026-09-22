import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "../../lib/utils";

type Props = {
  ouvert: boolean;
  titre: string;
  description?: string;
  onFermer: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({ ouvert, titre, description, onFermer, children, className }: Props) {
  // Échap ferme, et le défilement de l'arrière-plan est bloqué : sans ça, la page continue de
  // défiler sous la fenêtre sur mobile.
  useEffect(() => {
    if (!ouvert) return;

    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") onFermer();
    };

    document.addEventListener("keydown", surTouche);
    const debordementInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = debordementInitial;
    };
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-foreground/20 backdrop-blur-sm"
        onClick={onFermer}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={cn(
          "relative z-10 w-full max-w-lg animate-fade-up rounded-t-lg bg-card p-6 shadow-card sm:rounded-lg sm:p-8",
          className,
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">{titre}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onFermer}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
