import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variante = "primary" | "secondary" | "ghost" | "destructive" | "accent";
type Taille = "sm" | "md" | "lg" | "icon";

const VARIANTES: Record<Variante, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
};

const TAILLES: Record<Taille, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-sm",
  icon: "h-10 w-10",
};

// Exporte les classes pour pouvoir donner l apparence d un bouton a un <Link> : imbriquer un
// <a> dans un <button> est invalide en HTML et casse la navigation au clavier.
export function classesBouton({
  variante = "primary",
  taille = "md",
  className,
}: { variante?: Variante; taille?: Taille; className?: string } = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase tracking-[0.15em]",
    "transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTES[variante],
    TAILLES[taille],
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  taille?: Taille;
  enCours?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variante = "primary", taille = "md", enCours = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      // Un bouton en cours reste désactivé : sans ça, un double-clic sur « Enregistrer » crée
      // deux produits.
      disabled={disabled || enCours}
      className={classesBouton({ variante, taille, className })}
      {...props}
    >
      {enCours && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
