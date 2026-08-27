import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ImageOff, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

import { ItemCard } from "@/components/ItemCard";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CONTACT, SITE_NAME, whatsappOrderLink } from "@/lib/contact";
import { categoryLabel, formatPrice } from "@/lib/format";
import { useImageUrls } from "@/lib/images";
import { fetchItem, fetchRelated, type Item } from "@/lib/items";

export const Route = createFileRoute("/catalogue/$id")({
  head: () => ({
    meta: [
      { title: `Fiche produit — ${SITE_NAME}` },
      {
        name: "description",
        content: `Détail d'un produit du catalogue ${SITE_NAME} : description, disponibilité et commande par WhatsApp.`,
      },
      { property: "og:title", content: `Fiche produit — ${SITE_NAME}` },
      {
        property: "og:description",
        content: `Description, disponibilité et commande par WhatsApp.`,
      },
    ],
  }),
  component: ItemPage,
  errorComponent: ({ error }) => (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl">Cette fiche n'a pas pu être chargée</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl">Produit introuvable</h1>
      </div>
    </Layout>
  ),
});

function ItemPage() {
  const { id } = Route.useParams();

  const itemQuery = useQuery({
    queryKey: ["item", id],
    queryFn: () => fetchItem(id),
  });

  const item = itemQuery.data ?? null;

  const relatedQuery = useQuery({
    queryKey: ["item-related", item?.id, item?.category],
    queryFn: () => fetchRelated(item as Item),
    enabled: Boolean(item),
  });

  if (itemQuery.isLoading) {
    return (
      <Layout>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="shimmer aspect-square w-full rounded-[2rem]" />
          <div className="space-y-4">
            <div className="shimmer h-4 w-24 rounded-full" />
            <div className="shimmer h-9 w-3/4 rounded-full" />
            <div className="shimmer h-4 w-full rounded-full" />
            <div className="shimmer h-4 w-5/6 rounded-full" />
            <div className="shimmer h-12 w-48 rounded-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl">Ce produit n'existe plus</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/catalogue" search={{ category: "", q: "", page: 1 }}>
              Retour au catalogue
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <Breadcrumb item={item} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
          <Gallery images={item.images} name={item.name} />
          <InfoColumn item={item} />
        </div>

        {(relatedQuery.data?.length ?? 0) > 0 && (
          <section className="mt-24 border-t border-border pt-10">
            <p className="text-[0.68rem] font-bold tracking-[0.22em] text-muted-foreground uppercase">
              Continuer la découverte
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Vous aimerez aussi
            </h2>
            <div className="stagger mt-7 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {relatedQuery.data?.map((related) => (
                <ItemCard key={related.id} item={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

function Breadcrumb({ item }: { item: Item }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        <li>
          <Link
            to="/catalogue"
            search={{ category: "", q: "", page: 1 }}
            className="link-underline hover:text-foreground"
          >
            Catalogue
          </Link>
        </li>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <li>
          <Link
            to="/catalogue"
            search={{ category: item.category, q: "", page: 1 }}
            className="link-underline hover:text-foreground"
          >
            {categoryLabel(item.category)}
          </Link>
        </li>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <li aria-current="page" className="text-foreground">
          {item.name}
        </li>
      </ol>
    </nav>
  );
}

function Gallery({ images, name }: { images: string[]; name: string }) {
  const urls = useImageUrls(images);
  const [active, setActive] = useState(0);
  const current = urls[active] ?? null;

  return (
    <div className="space-y-3">
      <div className="product-placeholder aspect-square overflow-hidden rounded-[2rem]">
        {current ? (
          <img src={current} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <ImageOff className="h-8 w-8 text-primary/35" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Photo à venir</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((path, index) => (
            <button
              key={path}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Voir la photo ${index + 1} de ${name}`}
              aria-current={index === active}
              className={
                index === active
                  ? "h-16 w-16 overflow-hidden rounded-xl border-2 border-accent"
                  : "h-16 w-16 overflow-hidden rounded-xl border border-border opacity-65 transition-opacity hover:opacity-100"
              }
            >
              {urls[index] ? (
                <img
                  src={urls[index] as string}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="shimmer block h-full w-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoColumn({ item }: { item: Item }) {
  const inStock = item.available && item.stock > 0;

  return (
    <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground sm:p-8 lg:sticky lg:top-32 lg:self-start lg:p-10">
      <span className="inline-flex rounded-full border border-primary-foreground/20 px-3 py-1.5 text-[0.62rem] font-bold tracking-[0.18em] text-primary-foreground/70 uppercase">
        {categoryLabel(item.category)}
      </span>
      <h1 className="balance mt-5 font-display text-4xl leading-[0.98] font-bold tracking-[-0.05em] sm:text-5xl">
        {item.name}
      </h1>

      <div className="mt-7 flex flex-wrap items-center gap-3 border-y border-primary-foreground/15 py-5">
        <span className="text-3xl font-extrabold">{formatPrice(item.price)}</span>
        <span
          className={
            inStock
              ? "rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold text-primary-foreground"
              : "rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground/55"
          }
        >
          {inStock ? `Disponible · ${item.stock} en stock` : "Indisponible pour le moment"}
        </span>
      </div>

      {item.description && (
        <p className="mt-6 leading-7 text-primary-foreground/70">{item.description}</p>
      )}

      {inStock ? (
        <Button
          asChild
          size="lg"
          className="mt-8 w-full rounded-full bg-background text-foreground hover:bg-background/90"
        >
          <a href={whatsappOrderLink(item.name, item.price)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Commander sur WhatsApp
          </a>
        </Button>
      ) : (
        <Button
          size="lg"
          className="mt-8 w-full rounded-full bg-primary-foreground/10 text-primary-foreground/50"
          disabled
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Produit indisponible
        </Button>
      )}
      <p className="mt-3 text-center text-xs text-primary-foreground/50">
        Le message est pré-rempli avec le nom du produit.
      </p>

      <div className="mt-8 space-y-3 border-t border-primary-foreground/15 pt-6">
        <h2 className="text-[0.65rem] font-bold tracking-[0.2em] text-primary-foreground/55 uppercase">
          Une question ?
        </h2>
        <a
          href={CONTACT.phoneHref}
          className="flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
          {CONTACT.phone}
        </a>
        <a
          href={CONTACT.emailHref}
          className="flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
          {CONTACT.email}
        </a>
      </div>
    </div>
  );
}
