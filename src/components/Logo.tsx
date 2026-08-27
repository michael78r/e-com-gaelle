import { SITE_NAME } from "@/lib/contact";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  inverted = false,
}: {
  className?: string;
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem]",
          inverted ? "bg-background text-primary" : "bg-primary text-primary-foreground",
        )}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <path
            d="M8 9.5 12 23l4-8 4 8 4-13.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.5 7.5c2.9-.2 4.7-1.4 5.5-3.5.3 3-1.1 5-4.3 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col">
          <span
            className={cn(
              "font-display text-2xl leading-none font-bold tracking-[-0.06em]",
              inverted ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {SITE_NAME}
          </span>
          <span
            className={cn(
              "mt-1 text-[0.58rem] leading-none font-semibold tracking-[0.22em] uppercase",
              inverted ? "text-primary-foreground/65" : "text-muted-foreground",
            )}
          >
            Épicerie gourmande
          </span>
        </span>
      )}
    </span>
  );
}
