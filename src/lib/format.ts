/**
 * Helpers de formatage partagés.
 * Aucun `toLocaleString` ne doit être écrit directement dans un composant.
 */

export const CURRENCY_SUFFIX = " Ar";

/** Formate un prix en Ariary : 890000 -> "890 000 Ar" */
export function formatPrice(value: number | null | undefined): string {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `${amount.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}${CURRENCY_SUFFIX}`;
}

/** Formate un entier : 1234 -> "1 234" */
export function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

/** Formate une date ISO en date courte française. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export type CategorySlug =
  | "mobilier"
  | "luminaires"
  | "textiles"
  | "vannerie"
  | "céramique"
  | "autres";

export const CATEGORIES: { slug: CategorySlug; label: string }[] = [
  { slug: "mobilier", label: "Mobilier" },
  { slug: "luminaires", label: "Luminaires" },
  { slug: "textiles", label: "Textiles" },
  { slug: "vannerie", label: "Vannerie" },
  { slug: "céramique", label: "Céramique" },
  { slug: "autres", label: "Autres" },
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
}

/** Accorde le mot « pièce » selon le nombre. */
export function pieceLabel(count: number): string {
  return count > 1 ? "pièces disponibles" : "pièce disponible";
}
