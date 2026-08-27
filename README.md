# Wishly

Catalogue gourmand en ligne pour Madagascar. La boutique présente des chocolats, confitures,
biscuits, boissons et produits d'épicerie, avec commande directe par WhatsApp.

## Fonctionnalités

- catalogue public avec recherche, catégories et pagination ;
- fiches produit avec galerie, prix, stock et disponibilité ;
- commande WhatsApp pré-remplie ;
- espace administrateur avec authentification, rôles, CRUD et téléversement d'images ;
- Supabase pour PostgreSQL, Auth et Storage.

## Modèle produit

La table `items` utilise volontairement un modèle simple et polyvalent :

- `id`
- `name`
- `description`
- `category`
- `price`
- `stock`
- `available`
- `images`
- `created_at`
- `updated_at`

Les anciens champs propres au mobilier (`material`, `dimensions`, `origin`) ont été supprimés.

## Développement

```sh
npm install
npm run dev
```

Vérifications :

```sh
npm run lint
npm run build
```

## Supabase

Les migrations sont stockées dans `supabase/migrations/` et doivent être exécutées dans l'ordre.
Le bucket privé `item-images` stocke les chemins des photos utilisées par les produits.

Variables attendues :

```dotenv
SUPABASE_PROJECT_ID="your-project-ref"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PROJECT_ID="your-project-ref"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
```

Ne jamais exposer une clé `service_role` dans une variable `VITE_*` ou dans le dépôt.

## Lovable

Ce dépôt reste connecté au projet Lovable. Évitez de réécrire l'historique Git publié : les commits
envoyés sur la branche connectée sont synchronisés avec l'éditeur Lovable.
