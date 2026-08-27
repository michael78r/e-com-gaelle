import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Nombre de pages visibles autour de la page courante. */
  siblings?: number;
};

type PageToken = number | "ellipsis-start" | "ellipsis-end";

/** Fenêtre glissante avec ellipses : 1 … 4 5 [6] 7 8 … 20 */
export function buildPageTokens(page: number, totalPages: number, siblings = 2): PageToken[] {
  if (totalPages <= 1) return [1];

  const first = 1;
  const last = totalPages;
  const start = Math.max(first + 1, page - siblings);
  const end = Math.min(last - 1, page + siblings);

  const tokens: PageToken[] = [first];
  if (start > first + 1) tokens.push("ellipsis-start");
  for (let i = start; i <= end; i += 1) tokens.push(i);
  if (end < last - 1) tokens.push("ellipsis-end");
  if (last > first) tokens.push(last);

  return tokens;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  siblings = 2,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const tokens = buildPageTokens(page, totalPages, siblings);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      <Button
        variant="outline"
        size="icon"
        aria-label="Page précédente"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-full"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>

      {tokens.map((token) =>
        typeof token === "number" ? (
          <Button
            key={token}
            variant={token === page ? "default" : "ghost"}
            size="icon"
            aria-label={`Page ${token}`}
            aria-current={token === page ? "page" : undefined}
            onClick={() => onPageChange(token)}
            className="rounded-full font-medium"
          >
            {token}
          </Button>
        ) : (
          <span
            key={token}
            aria-hidden="true"
            className="px-1 text-sm text-muted-foreground select-none"
          >
            …
          </span>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        aria-label="Page suivante"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-full"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
