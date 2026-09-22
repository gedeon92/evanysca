import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}

export function SquelettesGrille({ nombre = 6 }: { nombre?: number }) {
  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: nombre }, (_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SqueletteFiche() {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="space-y-5 py-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  );
}
