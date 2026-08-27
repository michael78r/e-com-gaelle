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
      { title: `Fiche article — ${SITE_NAME}` },
      {
        name: "description",
        content: `Détail d'une pièce du catalogue ${SITE_NAME} : matière, dimensions, disponibilité et commande par WhatsApp.`,
      },
      { property: "og:title", content: `Fiche article — ${SITE_NAME}` },
      {
        property: "og:description",
        content: `Matière, dimensions, disponibilité et commande par WhatsApp.`,
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
        <h1 className="font-display text-2xl">Article introuvable</h1>
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
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
          <div className="shimmer aspect-4/5 w-full rounded-3xl" />
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
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-2xl">Cet article n'existe plus</h1>
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
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Breadcrumb item={item} />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <Gallery images={item.images} name={item.name} />
          <InfoColumn item={item} />
        </div>

        {(relatedQuery.data?.length ?? 0) > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl">Vous aimerez aussi</h2>
            <div className="stagger mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {relatedQuery.data?.map((related) => <ItemCard key={related.id} item={related} />)}
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
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
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
      <div className="surface aspect-4/5 overflow-hidden rounded-3xl bg-metal-gradient">
        {current ? (
          <img src={current} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <ImageOff className="h-8 w-8 text-sage-deep/40" aria-hidden="true" />
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
                  ? "h-16 w-16 overflow-hidden rounded-xl border-2 border-clay"
                  : "h-16 w-16 overflow-hidden rounded-xl border border-border opacity-75 transition-opacity hover:opacity-100"
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
  const specs = [
    { label: "Catégorie", value: categoryLabel(item.category) },
    { label: "Matière", value: item.material },
    { label: "Dimensions", value: item.dimensions },
    { label: "Provenance", value: item.origin },
  ].filter((spec) => spec.value);

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <span className="eyebrow text-clay-deep">{categoryLabel(item.category)}</span>
      <h1 className="balance mt-2 font-display text-3xl leading-tight sm:text-4xl">{item.name}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-semibold">{formatPrice(item.price)}</span>
        <span
          className={
            item.available && item.stock > 0
              ? "rounded-full bg-sage-light px-3 py-1 text-xs font-semibold text-sage-shadow"
              : "rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
          }
        >
          {item.available && item.stock > 0
            ? `Disponible · ${item.stock} en stock`
            : "Indisponible pour le moment"}
        </span>
      </div>

      {item.description && (
        <p className="mt-5 leading-relaxed text-muted-foreground">{item.description}</p>
      )}

      {specs.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-6 text-sm">
          {specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-muted-foreground">{spec.label}</dt>
              <dd className="mt-0.5 font-medium text-foreground">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <Button
        asChild
        size="lg"
        className="mt-8 w-full rounded-full"
        disabled={!item.available || item.stock === 0}
      >
        <a href={whatsappOrderLink(item.name, item.price)} target="_blank" rel="noreferrer">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Commander sur WhatsApp
        </a>
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Le message est pré-rempli avec le nom de l'article.
      </p>

      <div className="surface mt-8 space-y-3 p-5">
        <h2 className="eyebrow text-clay-deep">Une question ?</h2>
        <a
          href={CONTACT.phoneHref}
          className="link-underline flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
          {CONTACT.phone}
        </a>
        <a
          href={CONTACT.emailHref}
          className="link-underline flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
          {CONTACT.email}
        </a>
      </div>
    </div>
  );
}
