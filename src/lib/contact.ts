/**
 * Coordonnées de la boutique — source unique de vérité.
 * Modifier ici met à jour le header, le footer, la fiche produit et les CTA.
 */

export const SITE_NAME = "Whisly";
export const SITE_TAGLINE = "Boutique en ligne d'objets pour la maison";

export const CONTACT = {
  phone: "+261 34 12 345 67",
  phoneHref: "tel:+261341234567",
  email: "contact@whisly.mg",
  emailHref: "mailto:contact@whisly.mg",
  whatsapp: "261341234567",
  city: "Antananarivo, Madagascar",
} as const;

/** Lien WhatsApp pré-rempli avec le nom de l'article. */
export function whatsappOrderLink(itemName: string, price?: number): string {
  const parts = [
    `Bonjour ${SITE_NAME},`,
    `je souhaite commander : ${itemName}`,
    price !== undefined ? `(${price.toLocaleString("fr-FR")} Ar)` : "",
  ].filter(Boolean);
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(parts.join(" "))}`;
}

/** Lien WhatsApp générique, sans article. */
export function whatsappContactLink(): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    `Bonjour ${SITE_NAME}, j'ai une question.`,
  )}`;
}
