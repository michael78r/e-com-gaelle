import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { useCoverUrl } from "@/lib/images";
import { formatPrice } from "@/lib/format";
import type { Item } from "@/lib/items";

export function ItemCard({ item }: { item: Item }) {
  const cover = useCoverUrl(item.images);
  const inStock = item.available && item.stock > 0;

  return (
    <Link to="/catalogue/$id" params={{ id: item.id }} className="group block min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-secondary">
        {cover ? (
          <img
            src={cover}
            alt={item.name}
            loading="lazy"
            className="img-zoom h-full w-full object-cover"
          />
        ) : (
          <div className="product-placeholder flex h-full w-full items-center justify-center">
            <ImageOff className="h-7 w-7 text-primary/35" aria-hidden="true" />
          </div>
        )}

        <span className="absolute inset-x-2.5 bottom-2.5 rounded-xl bg-accent/95 px-3 py-2 text-center text-[0.65rem] font-semibold text-accent-foreground backdrop-blur">
          {inStock ? "Disponible" : "Indisponible pour le moment"}
        </span>
      </div>

      <div className="px-1 pt-3 sm:pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-display text-base leading-tight font-bold text-foreground sm:text-xl">
            {item.name}
          </h3>
          <p className="shrink-0 text-sm font-extrabold text-foreground sm:text-base">
            {formatPrice(item.price)}
          </p>
        </div>
        <p className="mt-1.5 hidden line-clamp-2 text-sm leading-5 text-muted-foreground sm:block">
          {item.description}
        </p>
      </div>
    </Link>
  );
}

export function ItemCardSkeleton() {
  return (
    <div>
      <div className="shimmer aspect-square w-full rounded-[1.4rem]" />
      <div className="space-y-2 px-1 pt-4">
        <div className="flex justify-between gap-3">
          <div className="shimmer h-5 w-2/3 rounded-full" />
          <div className="shimmer h-5 w-20 rounded-full" />
        </div>
        <div className="shimmer hidden h-3 w-full rounded-full sm:block" />
      </div>
    </div>
  );
}
