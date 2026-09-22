import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, total, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Page {page} sur {totalPages} — {total} élément{total > 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variante="secondary"
          taille="icon"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variante="secondary"
          taille="icon"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
