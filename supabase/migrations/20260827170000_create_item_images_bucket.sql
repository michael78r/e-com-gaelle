INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', false)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;
