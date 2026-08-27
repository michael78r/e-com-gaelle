import { Link } from "@tanstack/react-router";
import { ChevronRight, Mail, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { CONTACT, SITE_NAME, SITE_TAGLINE, whatsappContactLink } from "@/lib/contact";
import { CATEGORIES } from "@/lib/format";

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto flex h-7 w-full max-w-7xl items-center justify-between px-4 text-[0.62rem] font-semibold tracking-[0.16em] uppercase sm:px-6 lg:px-8">
            <span>{CONTACT.city}</span>
            <span className="hidden sm:inline">Commande directe par message</span>
          </div>
        </div>

        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            to="/catalogue"
            search={{ category: "", q: "", page: 1 }}
            aria-label={`${SITE_NAME} — accueil`}
          >
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-7 lg:flex">
            <Link to="/catalogue" search={{ category: "", q: "", page: 1 }} className="nav-link">
              Tout voir
            </Link>
            {CATEGORIES.slice(0, 5).map((category) => (
              <Link
                key={category.slug}
                to="/catalogue"
                search={{ category: category.slug, q: "", page: 1 }}
                className="nav-link"
              >
                {category.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center md:flex">
            <Button asChild className="h-10 rounded-full px-5">
              <a href={whatsappContactLink()} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Nous écrire
              </a>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            aria-label={open ? "Fermer les catégories" : "Explorer les catégories"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>

        {open && (
          <div className="absolute inset-x-0 top-full border-y border-border bg-background shadow-lift lg:hidden">
            <nav aria-label="Catégories" className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
              <p className="mb-3 text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Explorer le catalogue
              </p>
              <div className="grid sm:grid-cols-2">
                <Link
                  to="/catalogue"
                  search={{ category: "", q: "", page: 1 }}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-b border-border py-3.5 text-lg font-semibold"
                >
                  Tous les produits
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                {CATEGORIES.map((category, index) => (
                  <Link
                    key={category.slug}
                    to="/catalogue"
                    search={{ category: category.slug, q: "", page: 1 }}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-border py-3.5 text-lg font-semibold sm:px-4"
                  >
                    <span>
                      <span className="mr-3 text-xs font-medium text-muted-foreground">
                        0{index + 1}
                      </span>
                      {category.label}
                    </span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 bg-primary text-primary-foreground">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8 lg:py-20">
          <div>
            <Logo inverted />
            <p className="mt-5 max-w-sm text-sm leading-6 text-primary-foreground/65">
              {SITE_TAGLINE}. Découvrez le catalogue et contactez-nous directement pour commander.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase">Le catalogue</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    to="/catalogue"
                    search={{ category: category.slug, q: "", page: 1 }}
                    className="text-primary-foreground/65 transition-colors hover:text-primary-foreground"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase">Nous contacter</h2>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/65">
              <li>
                <a
                  href={CONTACT.phoneHref}
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary-foreground"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.emailHref}
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary-foreground"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {CONTACT.city}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-[0.68rem] tracking-[0.12em] text-primary-foreground/50 uppercase sm:px-6 lg:px-8">
            <span>
              © {new Date().getFullYear()} {SITE_NAME}
            </span>
            <span>Madagascar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
