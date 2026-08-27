CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  stock int NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  images text[] NOT NULL DEFAULT '{}',
  material text NOT NULL DEFAULT '',
  dimensions text NOT NULL DEFAULT '',
  origin text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Lecture publique du catalogue"
  ON public.items FOR SELECT
  USING (true);

CREATE POLICY "Les admins ajoutent des articles"
  ON public.items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Les admins modifient les articles"
  ON public.items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Les admins suppriment les articles"
  ON public.items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Chacun lit ses propres roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER items_set_updated_at
BEFORE UPDATE ON public.items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Images des articles visibles par tous"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "Les admins televersent des images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'item-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Les admins modifient les images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'item-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Les admins suppriment les images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'item-images' AND public.has_role(auth.uid(), 'admin'));

INSERT INTO public.items (name, description, category, price, stock, available, images, material, dimensions, origin) VALUES
('Fauteuil en rotin tressé', 'Fauteuil au dossier arrondi, tressage serré et finition naturelle. Assise profonde et confortable.', 'mobilier', 890000, 4, true, '{}', 'Rotin', '72 × 68 × 95 cm', 'Antananarivo'),
('Table basse en bois de palissandre', 'Plateau massif poncé, piètement conique. Les veines du bois varient d''une pièce à l''autre.', 'mobilier', 1250000, 2, true, '{}', 'Palissandre', '110 × 60 × 42 cm', 'Fianarantsoa'),
('Suspension en fibre de raphia', 'Abat-jour tressé en raphia clair, diffusion douce de la lumière. Douille E27 fournie.', 'luminaires', 320000, 9, true, '{}', 'Raphia', 'Ø 45 × 38 cm', 'Toamasina'),
('Lampe à poser en céramique émaillée', 'Pied en céramique tournée, émail satiné vert sauge. Abat-jour en lin écru.', 'luminaires', 415000, 5, true, '{}', 'Céramique, lin', 'Ø 24 × 52 cm', 'Antsirabe'),
('Plaid en coton tissé', 'Tissage à motifs géométriques, franges nouées. Coton doux lavable à 30°.', 'textiles', 185000, 12, true, '{}', 'Coton', '130 × 180 cm', 'Antananarivo'),
('Coussin en lambaoany', 'Housse de coussin en tissu traditionnel, teintes terracotta et écrues. Fermeture à glissière.', 'textiles', 68000, 24, true, '{}', 'Coton imprimé', '45 × 45 cm', 'Mahajanga'),
('Panier de marché en vakoa', 'Grand panier tressé avec anses renforcées, pour le marché ou le rangement.', 'vannerie', 95000, 18, true, '{}', 'Vakoa', '40 × 28 × 32 cm', 'Sainte-Marie'),
('Corbeille plate en raphia', 'Corbeille peu profonde au tressage bicolore, à poser ou à accrocher au mur.', 'vannerie', 52000, 30, true, '{}', 'Raphia', 'Ø 34 × 7 cm', 'Toamasina'),
('Vase colonne en grès', 'Vase élancé en grès tourné, émail réactif aux nuances terracotta. Étanche.', 'céramique', 240000, 7, true, '{}', 'Grès', 'Ø 14 × 36 cm', 'Antsirabe'),
('Service de quatre bols émaillés', 'Quatre bols tournés, émail vert sauge à l''intérieur, extérieur brut.', 'céramique', 176000, 6, true, '{}', 'Grès émaillé', 'Ø 13 × 7 cm', 'Antsirabe'),
('Miroir cerclé de rotin', 'Miroir rond entouré d''un cadre en rotin tressé, attache en cuir au dos.', 'autres', 380000, 3, true, '{}', 'Rotin, verre', 'Ø 60 cm', 'Antananarivo'),
('Set de six dessous de verre en corne', 'Dessous de verre polis, chaque pièce présente un dégradé unique.', 'autres', 84000, 0, false, '{}', 'Corne', 'Ø 10 cm', 'Antananarivo');