import { cn } from "../../lib/utils";

// Un squelette plutôt qu'un rond qui tourne : la page ne saute pas quand les données arrivent.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}

export function SkeletonTableau({ lignes = 5 }: { lignes?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lignes }, (_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  );
}
