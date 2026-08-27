# Terra Lumière

Crée une application web complète, en français, avec la stack et l'architecture EXACTES décrites
ci-dessous. Ne substitue aucune techno : si tu ne peux pas utiliser TanStack Start, dis-le au lieu
de partir sur autre chose.

═══════════════════════════════════════════════════════════════════════
⬛ À REMPLIR — le reste du prompt est générique
═══════════════════════════════════════════════════════════════════════
NOM DU SITE ............ {{ex. "Whisly"}}
ACTIVITÉ ............... {{ex. "vente en ligne de produit"}}
ENTITÉ PRINCIPALE ...... {{ex. "produit" — l'objet listé, détaillé et administré}}
CATÉGORIES ............. {{ex. mobilier, luminaires, textiles, vannerie, céramique, autres}}
MONNAIE / FORMAT ....... {{ex. Ariary, format fr-FR, suffixe " Ar"}}
CONTACT ................ {{tél. +261 XX XX XXX XX · email contact@exemple.mg · WhatsApp 261XXXXXXXXX}}
MODE DE COMMANDE ....... {{ex. pas de panier : bouton WhatsApp pré-rempli avec le nom de l'article}}
PALETTE: vert sauve and terracota
TON / STYLE ............ {{ex. artisanal chaleureux, éditorial, beaucoup de blanc, photos plein cadre}}
═══════════════════════════════════════════════════════════════════════

## 1. Stack imposée

- TanStack Start (SSR) + @tanstack/react-router en routage par fichiers, React 19, TypeScript strict
- Vite 7
- Tailwind CSS v4 en configuration CSS-first : TOUT le thème vit dans `src/styles.css`
  via `@import "tailwindcss"`, `@theme inline { … }` et `@layer base/utilities`.
  Aucun `tailwind.config.js`.
- shadcn/ui (style new-york) + lucide-react pour les icônes
- @tanstack/react-query
- zod + @tanstack/zod-adapter pour valider les query params d'URL
- Supabase (Postgres + Auth + Storage) via @supabase/supabase-js
- sonner pour les toasts
- ESLint + Prettier, code formaté

## 2. Arborescence attendue

    src/
      routes/
        __root.tsx            head/meta, polices, favicon, pages 404 et erreur stylées
        index.tsx             redirige vers /catalogue
        catalogue.index.tsx   liste : hero, recherche, filtres, grille, pagination
        catalogue.$id.tsx     fiche détail + suggestions
        admin.tsx             auth + CRUD complet
      components/
        Layout.tsx            header sticky + nav + menu mobile + footer
        ItemCard.tsx          la carte du catalogue
        Pagination.tsx        composant réutilisé par la boutique ET l'admin
        Logo.tsx
        ui/                   composants shadcn
      lib/
        utils.ts (cn), format.ts (prix + libellés de catégorie), contact.ts
      integrations/supabase/  client.ts + types.ts générés
      styles.css              le design system complet

## 3. Base de données Supabase

Table `items` : id uuid pk default gen_random_uuid(), name text not null, description text
default '', category text not null, price numeric default 0, stock int default 0,
available boolean default true, images text[] default '{}', created_at / updated_at timestamptz.
+ les CHAMPS SPÉCIFIQUES indiqués plus haut.

Rôles : enum `app_role` ('admin','user'), table `user_roles (user_id, role)`, et une fonction
`has_role(uuid, app_role)` en SECURITY DEFINER — jamais de lecture de rôle directement dans une
policy RLS (récursion).

RLS : lecture publique sur `items` ; insert/update/delete réservés à `has_role(auth.uid(),'admin')`.
Storage : bucket public `item-images`, upload réservé aux admins.

## 4. Fonctionnalités

**Catalogue** (`/catalogue`)
- Query params validés par zod et typés : `category` (string, défaut ""), `q` (string, défaut ""),
  `page` (NUMBER, défaut 1 — surtout pas une string, sinon l'URL affiche ?page=%221%22).
- Le filtre catégorie et la recherche passent DANS la requête Supabase (`.eq()`, `.or(ilike)`)
  AVANT `.range()`. Ne filtre jamais côté client après pagination : le compteur et la pagination
  seraient faux.
- Si `range()` renvoie une erreur (PostgREST 416 quand la page dépasse le nombre de résultats),
  renvoie l'utilisateur en page 1 avec `replace: true` au lieu d'afficher "0 résultat".
- États : skeletons animés pendant le chargement, état vide soigné avec bouton de réinitialisation,
  compteur "N pièces disponibles".

**Fiche** (`/catalogue/$id`) : fil d'Ariane, galerie avec vignettes cliquables, colonne d'infos
sticky en desktop, badge de disponibilité, CTA de commande, bloc contact, section "Vous aimerez
aussi" (même catégorie, item courant exclu, limite 4).

**Admin** (`/admin`) : connexion/inscription Supabase, vérification du rôle admin, écran "accès
refusé" expliquant comment se promouvoir, tableau paginé, dialogue de création/édition, upload
multi-images vers le Storage avec aperçu et suppression, confirmation avant suppression (qui purge
aussi les fichiers du bucket), toasts sonner. `robots: noindex`.

## 5. Design system (le cœur du travail)

Dans `src/styles.css` uniquement :
- Palette en **OKLCH**, 6 à 8 tokens de marque + les rôles UI (background, foreground, card,
  primary, secondary, muted, accent, border, input, ring, destructive). Mode sombre complet
  sous `.dark`.
- Si la palette doit venir du logo : échantillonne ses teintes dominantes et décline-les en
  clair / signature / profond / ombre, plutôt que d'inventer des couleurs.
- Deux dégradés distincts, jamais interchangeables :
  `.bg-brand-gradient` = version FONCÉE, seule autorisée sous du texte clair ;
  `.bg-metal-gradient` = version claire/brillante, purement décorative.
- Utilitaires maison : `.surface`, `.shadow-soft`, `.shadow-lift`, `.card-hover`, `.img-zoom`,
  `.eyebrow` (uppercase + letter-spacing .24em), `.stagger` (apparition en cascade),
  `.shimmer` (skeletons), `.fade-up`, `.balance`, `.link-underline`, `.bg-linen` (fond en
  dégradés radiaux doux).
- Ombres teintées de la couleur de marque, jamais du noir pur.
- Rayons généreux (≈0.875rem de base), cartes en `rounded-2xl`.
- Typo : une serif de caractère pour les titres + Inter pour le texte, chargées via Google Fonts
  dans `__root.tsx` avec `preconnect`.
- Bloc `@media (prefers-reduced-motion: reduce)` qui neutralise animations et transitions.

**Règles non négociables**
- Contraste WCAG ≥ 4.5:1 pour tout texte ; vérifie AVANT de valider un bouton coloré. Du blanc sur
  une couleur claire est interdit.
- `:focus-visible` visible partout, `aria-label` sur les boutons icône, `alt` sur les images.
- Mobile : la grille de cartes est en **2 colonnes dès le plus petit écran**
  (`grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4`), avec titre, description et
  paddings réduits sous `sm`, et les éléments de survol masqués (inutiles au toucher).
- Menu mobile fonctionnel (le header n'est pas juste "hidden md:flex").
- Aucune affirmation commerciale inventée dans l'UI ("fait main", "livraison 24h", "paiement
  sécurisé"…) : n'écris que ce que le brief ci-dessus affirme.

## 6. Qualité de code

- Un helper de formatage de prix partagé (`toLocaleString("fr-FR")`), jamais de `toLocaleString`
  improvisé dans les composants.
- Un composant Pagination unique (fenêtre glissante avec ellipses : 1 … 4 5 [6] 7 8 … 20),
  réutilisé par le catalogue et l'admin.
- Les coordonnées de contact dans un seul module, importées partout.
- Pas de fichier vide, pas d'import mort, pas d'asset importé qui n'existe pas.
- `tsc --noEmit`, `eslint` et `vite build` doivent passer sans erreur.

## 7. Livraison

Livre l'app complète et fonctionnelle, avec les migrations SQL (tables, enum, fonction
`has_role`, policies RLS, bucket Storage) et un jeu de données de démonstration d'une dizaine
d'entrées pour que le catalogue ne soit pas vide.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3b13c896-5650-4dba-8f43-a552d0883949).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
