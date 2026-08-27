import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { CONTACT, SITE_NAME, SITE_TAGLINE, whatsappContactLink } from "@/lib/contact";
import { CATEGORIES } from "@/lib/format";

const NAV = [
  { to: "/catalogue", label: "Catalogue" },
  { to: "/admin", label: "Administration" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/catalogue" aria-label={`${SITE_NAME} — accueil`}>
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
            {NAV.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="ml-2 rounded-full">
              <a href={whatsappContactLink()} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Nous écrire
              </a>
            </Button>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
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
          <div className="border-t border-border/70 bg-background md:hidden">
            <nav aria-label="Navigation mobile" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
              <ul className="flex flex-col">
                {NAV.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-2 py-3 text-base font-medium text-foreground hover:bg-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.slug}
                    to="/catalogue"
                    search={{ category: category.slug, q: "", page: 1 }}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
              <Button asChild className="mt-3 w-full rounded-full">
                <a href={whatsappContactLink()} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Nous écrire sur WhatsApp
                </a>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-border/70 bg-background">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">{SITE_TAGLINE}.</p>
          </div>

          <div>
            <h2 className="eyebrow text-clay-deep">Catégories</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    to="/catalogue"
                    search={{ category: category.slug, q: "", page: 1 }}
                    className="link-underline text-muted-foreground hover:text-foreground"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-clay-deep">Contact</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href={CONTACT.phoneHref} className="link-underline inline-flex items-center gap-2 hover:text-foreground">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={CONTACT.emailHref} className="link-underline inline-flex items-center gap-2 hover:text-foreground">
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

        <div className="border-t border-border/70">
          <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>
      </footer>
    </div>
  );
}
