import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variante = "primaire" | "contour" | "accent" | "whatsapp" | "discret";
type Taille = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primaire: "bg-primary text-primary-foreground hover:bg-primary/90",
  contour: "border border-foreground/20 text-foreground hover:border-foreground/50",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  // Vert officiel de WhatsApp : le bouton doit être reconnaissable au premier coup d'œil.
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1FBE5A]",
  discret: "text-foreground hover:bg-muted",
};

const TAILLES: Record<Taille, string> = {
  sm: "h-10 px-5 text-[0.6875rem]",
  md: "h-12 px-8 text-xs",
  lg: "h-14 px-10 text-xs",
};

export function classesBouton({
  variante = "primaire",
  taille = "md",
  className,
}: { variante?: Variante; taille?: Taille; className?: string } = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full uppercase tracking-[0.2em]",
    "transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-40",
    VARIANTES[variante],
    TAILLES[taille],
    className,
  );
}

type PropsBouton = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; taille?: Taille };

export const Bouton = forwardRef<HTMLButtonElement, PropsBouton>(function Bouton(
  { className, variante, taille, ...props },
  ref,
) {
  return <button ref={ref} className={classesBouton({ variante, taille, className })} {...props} />;
});

type PropsLien = AnchorHTMLAttributes<HTMLAnchorElement> & { variante?: Variante; taille?: Taille };

// Un vrai <a> : indispensable pour les liens wa.me, qu'un onClick asynchrone ferait bloquer par
// le navigateur sur iOS.
export const LienBouton = forwardRef<HTMLAnchorElement, PropsLien>(function LienBouton(
  { className, variante, taille, ...props },
  ref,
) {
  return <a ref={ref} className={classesBouton({ variante, taille, className })} {...props} />;
});
