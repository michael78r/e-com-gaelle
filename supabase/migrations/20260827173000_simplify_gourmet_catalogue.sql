-- Convert the catalogue to a simple, general-purpose food product model.
-- Existing user-created products, IDs, prices, stock and image paths are preserved.

-- Remove only untouched rows from the original furniture demo data.
DELETE FROM public.items
WHERE images = ARRAY[]::text[]
  AND name IN (
    'Fauteuil en rotin tressé',
    'Table basse en bois de palissandre',
    'Suspension en fibre de raphia',
    'Lampe à poser en céramique émaillée',
    'Plaid en coton tissé',
    'Coussin en lambaoany',
    'Panier de marché en vakoa',
    'Corbeille plate en raphia',
    'Vase colonne en grès',
    'Service de quatre bols émaillés',
    'Miroir cerclé de rotin',
    'Set de six dessous de verre en corne'
  );

ALTER TABLE public.items
  DROP COLUMN IF EXISTS material,
  DROP COLUMN IF EXISTS dimensions,
  DROP COLUMN IF EXISTS origin;

-- Reclassify existing products that still use one of the old furniture categories.
UPDATE public.items
SET category = CASE
  WHEN lower(name) LIKE '%chocolat%' THEN 'chocolats'
  WHEN lower(name) LIKE '%confiture%' OR lower(name) LIKE '%congiture%' THEN 'confitures'
  WHEN lower(name) LIKE '%biscuit%' OR lower(name) LIKE '%cookie%' THEN 'biscuits'
  WHEN lower(name) LIKE '%café%'
    OR lower(name) LIKE '%cafe%'
    OR lower(name) LIKE '%thé%'
    OR lower(name) LIKE '%boisson%' THEN 'boissons'
  WHEN lower(name) LIKE '%miel%'
    OR lower(name) LIKE '%tartiner%'
    OR lower(name) LIKE '%épice%'
    OR lower(name) LIKE '%epice%' THEN 'epicerie'
  ELSE 'autres'
END
WHERE category NOT IN ('chocolats', 'confitures', 'biscuits', 'boissons', 'epicerie', 'autres');

-- Seed a brand-new installation only. A catalogue that already contains real products is untouched.
INSERT INTO public.items (
  name,
  description,
  category,
  price,
  stock,
  available,
  images
)
SELECT *
FROM (
  VALUES
    (
      'Chocolat noir intense',
      'Un chocolat noir au goût profond, à savourer seul ou à partager.',
      'chocolats',
      18000,
      24,
      true,
      ARRAY[]::text[]
    ),
    (
      'Chocolat au lait fondant',
      'Une tablette douce et fondante aux notes généreuses de cacao et de lait.',
      'chocolats',
      16000,
      18,
      true,
      ARRAY[]::text[]
    ),
    (
      'Confiture de fraise',
      'Une confiture fruitée à déguster au petit-déjeuner ou au goûter.',
      'confitures',
      22000,
      20,
      true,
      ARRAY[]::text[]
    ),
    (
      'Confiture mangue-passion',
      'Une association douce et acidulée de mangue et de fruit de la passion.',
      'confitures',
      24000,
      16,
      true,
      ARRAY[]::text[]
    ),
    (
      'Biscuits sablés à la vanille',
      'Des biscuits croquants à la texture sablée et au parfum de vanille.',
      'biscuits',
      12000,
      30,
      true,
      ARRAY[]::text[]
    ),
    (
      'Cookies au chocolat',
      'Des cookies gourmands parsemés de morceaux de chocolat.',
      'biscuits',
      14000,
      22,
      true,
      ARRAY[]::text[]
    ),
    (
      'Café moulu',
      'Un café aromatique prêt à préparer pour accompagner la journée.',
      'boissons',
      28000,
      12,
      true,
      ARRAY[]::text[]
    ),
    (
      'Thé noir à la vanille',
      'Un thé noir parfumé d''une note ronde et délicate de vanille.',
      'boissons',
      19000,
      10,
      true,
      ARRAY[]::text[]
    ),
    (
      'Miel doré',
      'Un miel doux à ajouter aux tartines, boissons et recettes du quotidien.',
      'epicerie',
      26000,
      13,
      true,
      ARRAY[]::text[]
    ),
    (
      'Pâte à tartiner au cacao',
      'Une pâte à tartiner onctueuse au cacao pour les petits-déjeuners et goûters.',
      'epicerie',
      25000,
      0,
      false,
      ARRAY[]::text[]
    )
) AS seed(name, description, category, price, stock, available, images)
WHERE NOT EXISTS (SELECT 1 FROM public.items);
