import { useQueries } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const ITEM_IMAGES_BUCKET = "item-images";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Les images sont stockées sous forme de chemins dans le bucket `item-images`.
 * Le bucket étant privé, on résout chaque chemin en URL signée.
 */
export async function resolveImageUrl(path: string): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const { data, error } = await supabase.storage
    .from(ITEM_IMAGES_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error) return null;
  return data?.signedUrl ?? null;
}

/** Résout une liste de chemins en URLs affichables. */
export function useImageUrls(paths: string[]): (string | null)[] {
  const results = useQueries({
    queries: paths.map((path) => ({
      queryKey: ["image-url", path],
      queryFn: () => resolveImageUrl(path),
      staleTime: (SIGNED_URL_TTL_SECONDS - 300) * 1000,
    })),
  });

  return results.map((result) => result.data ?? null);
}

/** Résout la première image d'un produit (la vignette). */
export function useCoverUrl(images: string[]): string | null {
  const urls = useImageUrls(images.slice(0, 1));
  return urls[0] ?? null;
}
