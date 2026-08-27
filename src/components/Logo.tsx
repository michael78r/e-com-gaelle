import { SITE_NAME } from "@/lib/contact";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-9 w-9 shrink-0"
        role="img"
        aria-label={`Logo ${SITE_NAME}`}
      >
        <circle cx="20" cy="20" r="19" className="fill-primary" />
        <path
          d="M11 14c2.6 6 4.4 9.6 5.6 11 1.2-1.6 2.3-4.2 3.4-7.8 1.1 3.6 2.2 6.2 3.4 7.8 1.2-1.4 3-5 5.6-11"
          fill="none"
          className="stroke-clay-light"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span className="font-display text-xl leading-none tracking-tight text-foreground">
          {SITE_NAME}
        </span>
      )}
    </span>
  );
}
