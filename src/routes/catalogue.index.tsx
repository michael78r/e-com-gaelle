import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import heroImage from "@/assets/hero-whisly.jpg";
import { ItemCard, ItemCardSkeleton } from "@/components/ItemCard";
import { Layout } from "@/components/Layout";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/contact";
import { CATEGORIES, categoryLabel, formatNumber, pieceLabel } from "@/lib/format";
import { fetchCatalogue, PAGE_SIZE } from "@/lib/items";

const searchSchema = z.object({
  category: z.string().catch(""),
  q: z.string().catch(""),
  page: z.number().int().min(1).catch(1),
});

export const Route = createFileRoute("/catalogue/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: `Catalogue — ${SITE_NAME}` },
      {
        name: "description",
        content: `Parcourez le catalogue ${SITE_NAME} : mobilier, luminaires, textiles, vannerie et céramique. Commande par WhatsApp.`,
      },
      { property: "og:title", content: `Catalogue — ${SITE_NAME}` },
      {
        property: "og:description",
        content: `Mobilier, luminaires, textiles, vannerie et céramique. Commande par WhatsApp.`,
      },
    ],
  }),
  component: CataloguePage,
  errorComponent: ({ error }) => (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl">Le catalogue n'a pas pu être chargé</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl">Page introuvable</h1>
      </div>
    </Layout>
  ),
});

function CataloguePage() {
  const { category, q, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogue" });
  const [term, setTerm] = useState(q);

  useEffect(() => {
    setTerm(q);
  }, [q]);

  const query = useQuery({
    queryKey: ["catalogue", category, q, page],
    queryFn: () => fetchCatalogue({ category, q, page }),
    placeholderData: (previous) => previous,
  });

  const outOfRange = query.data?.outOfRange ?? false;

  // PostgREST 416 : la page dépasse le nombre de résultats -> retour page 1.
  useEffect(() => {
    if (outOfRange) {
      void navigate({
        search: (prev) => ({ ...prev, page: 1 }),
        replace: true,
      });
    }
  }, [outOfRange, navigate]);

  const count = query.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const hasFilters = Boolean(category || q);

  const setCategory = (next: string) =>
    void navigate({ search: (prev) => ({ ...prev, category: next, page: 1 }) });

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    void navigate({ search: (prev) => ({ ...prev, q: term, page: 1 }) });
  };

  const reset = () => void navigate({ search: { category: "", q: "", page: 1 } });

  return (
    <Layout>
      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="surface relative overflow-hidden rounded-3xl">
          <div className="grid items-stretch gap-0 md:grid-cols-2">
            <div className="fade-up flex flex-col justify-center gap-4 p-6 sm:p-10 lg:p-14">
              <span className="eyebrow text-clay-deep">{SITE_TAGLINE}</span>
              <h1 className="balance font-display text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">
                Des objets choisis pour la maison, à commander en un message
              </h1>
              <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                Parcourez le catalogue {SITE_NAME}, retenez la pièce qui vous plaît, puis
                envoyez-nous un message WhatsApp pré-rempli depuis sa fiche.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {CATEGORIES.slice(0, 4).map((entry) => (
                  <button
                    key={entry.slug}
                    type="button"
                    onClick={() => setCategory(entry.slug)}
                    className="rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-clay hover:text-clay-deep"
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative min-h-56 overflow-hidden md:min-h-full">
              <img
                src={heroImage}
                alt="Vase en céramique vert sauge, panier tressé, coupe en terre cuite et plaid tissé posés sur une toile de lin"
                width={1600}
                height={1104}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
        <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Rechercher une pièce, une matière…"
              aria-label="Rechercher dans le catalogue"
              className="h-11 rounded-full pl-9"
            />
          </div>
          <Button type="submit" className="h-11 rounded-full px-6">
            Rechercher
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setCategory("")}
            aria-pressed={category === ""}
            className={
              category === ""
                ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                : "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            Tout
          </button>
          {CATEGORIES.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              onClick={() => setCategory(entry.slug)}
              aria-pressed={category === entry.slug}
              className={
                category === entry.slug
                  ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {entry.label}
            </button>
          ))}

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={reset} className="rounded-full text-xs">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Réinitialiser
            </Button>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          {query.isLoading
            ? "Chargement du catalogue…"
            : `${formatNumber(count)} ${pieceLabel(count)}`}
          {category ? ` · ${categoryLabel(category)}` : ""}
          {q ? ` · « ${q} »` : ""}
        </p>
      </section>

      {/* Grille */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-4 sm:px-6">
        {query.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <ItemCardSkeleton key={index} />
            ))}
          </div>
        ) : count === 0 ? (
          <div className="surface mx-auto max-w-md px-6 py-14 text-center">
            <h2 className="font-display text-xl">Aucune pièce ne correspond</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Essayez un autre mot-clé ou explorez toutes les catégories.
            </p>
            <Button onClick={reset} className="mt-6 rounded-full">
              Réinitialiser la recherche
            </Button>
          </div>
        ) : (
          <div className="stagger grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {query.data?.items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(next) => {
            void navigate({ search: (prev) => ({ ...prev, page: next }) });
            if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </Layout>
  );
}
