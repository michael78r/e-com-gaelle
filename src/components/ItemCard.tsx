import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ImageOff } from "lucide-react";

import { useCoverUrl } from "@/lib/images";
import { categoryLabel, formatPrice } from "@/lib/format";
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

        <span className="absolute top-2.5 left-2.5 max-w-[70%] rounded-full bg-background/90 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.13em] text-foreground uppercase backdrop-blur sm:top-3 sm:left-3">
          {categoryLabel(item.category)}
        </span>

        <span className="absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:rotate-12 sm:top-3 sm:right-3">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>

        {!inStock && (
          <span className="absolute inset-x-2.5 bottom-2.5 rounded-xl bg-foreground/85 px-3 py-2 text-center text-[0.65rem] font-semibold text-background backdrop-blur">
            Indisponible pour le moment
          </span>
        )}
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
        <p className="mt-2 flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          <span
            className={
              inStock
                ? "h-1.5 w-1.5 rounded-full bg-emerald-600"
                : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
            }
          />
          {inStock ? `${item.stock} en stock` : "Rupture de stock"}
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
        <div className="shimmer h-3 w-24 rounded-full" />
      </div>
    </div>
  );
}
