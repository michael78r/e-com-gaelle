/**
 * Coordonnées de la boutique — source unique de vérité.
 * Modifier ici met à jour le header, le footer, la fiche produit et les CTA.
 */

export const SITE_NAME = "Wishly";
export const SITE_TAGLINE = "Boutique gourmande en ligne";

export const CONTACT = {
  phone: "+261 33 76 176 63",
  phoneHref: "tel:+261337617663",
  email: "gaellerakotobe9@gmail.com",
  emailHref: "mailto:gaellerakotobe9@gmail.com",
  whatsapp: "261337617663",
  city: "Antananarivo, Madagascar",
} as const;

/** Lien WhatsApp pré-rempli avec le nom du produit. */
export function whatsappOrderLink(itemName: string, price?: number): string {
  const parts = [
    `Bonjour ${SITE_NAME},`,
    `je souhaite commander : ${itemName}`,
    price !== undefined ? `(${price.toLocaleString("fr-FR")} Ar)` : "",
  ].filter(Boolean);
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(parts.join(" "))}`;
}

/** Lien WhatsApp générique, sans produit. */
export function whatsappContactLink(): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    `Bonjour ${SITE_NAME}, j'ai une question.`,
  )}`;
}
