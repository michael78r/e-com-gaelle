import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { useCoverUrl } from "@/lib/images";
import { categoryLabel, formatPrice } from "@/lib/format";
import type { Item } from "@/lib/items";

export function ItemCard({ item }: { item: Item }) {
  const cover = useCoverUrl(item.images);

  return (
    <Link
      to="/catalogue/$id"
      params={{ id: item.id }}
      className="group surface card-hover flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-metal-gradient">
        {cover ? (
          <img
            src={cover}
            alt={item.name}
            loading="lazy"
            className="img-zoom h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-7 w-7 text-sage-deep/40" aria-hidden="true" />
          </div>
        )}

        {!item.available && (
          <span className="absolute top-2 left-2 rounded-full bg-card/95 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase sm:top-3 sm:left-3">
            Indisponible
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-5">
        <span className="eyebrow hidden text-clay-deep sm:block">
          {categoryLabel(item.category)}
        </span>
        <h3 className="font-display text-sm leading-snug text-foreground sm:text-lg">
          {item.name}
        </h3>
        <p className="hidden line-clamp-2 text-sm text-muted-foreground sm:block">
          {item.description}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground sm:mt-2 sm:text-base">
          {formatPrice(item.price)}
        </p>
      </div>
    </Link>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <div className="shimmer aspect-4/5 w-full" />
      <div className="space-y-2 p-3 sm:p-5">
        <div className="shimmer hidden h-3 w-20 rounded-full sm:block" />
        <div className="shimmer h-4 w-3/4 rounded-full" />
        <div className="shimmer hidden h-3 w-full rounded-full sm:block" />
        <div className="shimmer h-4 w-24 rounded-full" />
      </div>
    </div>
  );
}
