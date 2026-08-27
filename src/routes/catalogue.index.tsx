import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import heroImage from "@/assets/hero-gourmand.jpg";
import { ItemCard, ItemCardSkeleton } from "@/components/ItemCard";
import { Layout } from "@/components/Layout";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_NAME } from "@/lib/contact";
import { CATEGORIES, categoryLabel, formatNumber, productLabel } from "@/lib/format";
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
        content: `Parcourez le catalogue gourmand ${SITE_NAME} : chocolats, confitures, biscuits, boissons et produits d'épicerie. Commande par WhatsApp.`,
      },
      { property: "og:title", content: `Catalogue — ${SITE_NAME}` },
      {
        property: "og:description",
        content: `Chocolats, confitures, biscuits, boissons et produits d'épicerie. Commande par WhatsApp.`,
      },
    ],
  }),
  component: CataloguePage,
  errorComponent: ({ error }) => (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">Erreur</p>
        <h1 className="mt-3 font-display text-3xl font-bold">
          Le catalogue n'a pas pu être chargé
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Page introuvable</h1>
      </div>
    </Layout>
  ),
});

function CataloguePage() {
  const { category, q, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogue/" });
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
      {/* <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] sm:min-h-[39rem] lg:rounded-[2.75rem]">
          <img
            src={heroImage}
            alt="Assortiment gourmand de chocolats, confitures, miel, biscuits, café et épices"
            width={1600}
            height={1104}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="hero-scrim absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 lg:p-14">
            <p className="fade-up text-[0.68rem] font-bold tracking-[0.24em] text-white/70 uppercase">
              Chocolats · confitures · épicerie
            </p>
            <h1 className="balance fade-up mt-4 max-w-3xl font-display text-4xl leading-[0.98] font-bold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Les bonnes choses commencent ici.
            </h1>
            <p className="fade-up mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
              Explorez le catalogue {SITE_NAME}, trouvez votre prochaine envie et commandez
              directement par message.
            </p>
            <a
              href="#produits"
              className="mt-7 inline-flex items-center gap-3 text-sm font-bold text-white"
            >
              Découvrir les produits
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-white/10 backdrop-blur">
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </section> */}

      <section id="produits" className="scroll-mt-32 pt-16 sm:pt-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.22em] text-muted-foreground uppercase">
                Notre catalogue
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                {category ? categoryLabel(category) : "Tous les produits"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
                {query.isLoading ? "Chargement…" : `${formatNumber(count)} ${productLabel(count)}`}
                {q ? ` pour « ${q} »` : ""}
              </p>
            </div>

            <form onSubmit={submitSearch} className="flex w-full max-w-xl gap-2">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Rechercher un produit"
                  aria-label="Rechercher dans le catalogue"
                  className="h-12 rounded-full border-border bg-secondary/60 pr-4 pl-11 shadow-none"
                />
              </div>
              <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-full">
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </form>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-5 lg:hidden">
            <CategoryButton active={!category} label="Tout" onClick={() => setCategory("")} />
            {CATEGORIES.map((entry) => (
              <CategoryButton
                key={entry.slug}
                active={category === entry.slug}
                label={entry.label}
                onClick={() => setCategory(entry.slug)}
              />
            ))}
          </div>

          <div className="grid gap-10 pt-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
              <div className="sticky top-36">
                <p className="mb-4 text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  Catégories
                </p>
                <div className="border-t border-border">
                  <CategoryRailButton
                    active={!category}
                    index="00"
                    label="Tout voir"
                    onClick={() => setCategory("")}
                  />
                  {CATEGORIES.map((entry, index) => (
                    <CategoryRailButton
                      key={entry.slug}
                      active={category === entry.slug}
                      index={`0${index + 1}`}
                      label={entry.label}
                      onClick={() => setCategory(entry.slug)}
                    />
                  ))}
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </aside>

            <div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={reset}
                  className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground lg:hidden"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Effacer les filtres
                </button>
              )}

              {query.isLoading ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
                  {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <ItemCardSkeleton key={index} />
                  ))}
                </div>
              ) : count === 0 ? (
                <div className="rounded-[2rem] bg-secondary px-6 py-16 text-center sm:px-10">
                  <p className="text-[0.68rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    Aucun résultat
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-bold">
                    Aucun produit ne correspond
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    Essayez un autre mot-clé ou revenez à l'ensemble du catalogue.
                  </p>
                  <Button onClick={reset} className="mt-6 rounded-full px-6">
                    Voir tous les produits
                  </Button>
                </div>
              ) : (
                <div className="stagger grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
                  {query.data?.items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(next) => {
                  void navigate({ search: (prev) => ({ ...prev, page: next }) });
                  if (typeof window !== "undefined") {
                    document.getElementById("produits")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="mt-14"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function CategoryButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          : "shrink-0 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground"
      }
    >
      {label}
    </button>
  );
}

function CategoryRailButton({
  active,
  index,
  label,
  onClick,
}: {
  active: boolean;
  index: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group flex w-full items-center gap-3 border-b border-border py-3.5 text-left"
    >
      <span className="text-[0.6rem] font-bold text-muted-foreground">{index}</span>
      <span
        className={
          active
            ? "text-sm font-extrabold text-foreground"
            : "text-sm font-semibold text-muted-foreground transition-colors group-hover:text-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          active
            ? "ml-auto h-2 w-2 rounded-full bg-accent"
            : "ml-auto h-2 w-2 rounded-full bg-border transition-colors group-hover:bg-muted-foreground"
        }
      />
    </button>
  );
}
