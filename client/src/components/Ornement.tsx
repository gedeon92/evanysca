import { cn } from "../lib/utils";

// Filet doré avec un losange au centre, posé sous les titres de section.
export function Ornement({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-gold", className)} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/70 sm:w-20" />
      <span className="text-[0.625rem]">✦</span>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/70 sm:w-20" />
    </div>
  );
}
