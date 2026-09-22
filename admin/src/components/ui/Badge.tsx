import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type Ton = "neutre" | "succes" | "alerte" | "danger" | "accent";

const TONS: Record<Ton, string> = {
  neutre: "bg-muted text-muted-foreground",
  succes: "bg-success/10 text-success",
  alerte: "bg-gold/15 text-gold-foreground",
  danger: "bg-destructive/10 text-destructive",
  accent: "bg-accent/10 text-accent",
};

export function Badge({ ton = "neutre", children, className }: { ton?: Ton; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.625rem] uppercase tracking-[0.2em]",
        TONS[ton],
        className,
      )}
    >
      {children}
    </span>
  );
}
