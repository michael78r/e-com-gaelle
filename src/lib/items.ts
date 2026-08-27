import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Item = Database["public"]["Tables"]["items"]["Row"];
export type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];

export const PAGE_SIZE = 8;
export const ADMIN_PAGE_SIZE = 10;

export type CatalogueParams = {
  category: string;
  q: string;
  page: number;
  pageSize?: number;
};

export type CatalogueResult = {
  items: Item[];
  count: number;
  /** Vrai quand la page demandée dépasse le nombre de résultats. */
  outOfRange: boolean;
};

export async function fetchCatalogue({
  category,
  q,
  page,
  pageSize = PAGE_SIZE,
}: CatalogueParams): Promise<CatalogueResult> {
  let query = supabase
    .from("items")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Les filtres passent DANS la requête, avant la pagination.
  if (category) query = query.eq("category", category);
  if (q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`name.ilike.${term},description.ilike.${term}`);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);

  if (error) {
    // PostgREST renvoie une 416 quand la plage dépasse le nombre de résultats.
    if (error.code === "PGRST103" || /range/i.test(error.message)) {
      return { items: [], count: count ?? 0, outOfRange: page > 1 };
    }
    throw error;
  }

  return { items: data ?? [], count: count ?? 0, outOfRange: false };
}

export async function fetchItem(id: string): Promise<Item | null> {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchRelated(item: Item): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("category", item.category)
    .neq("id", item.id)
    .order("created_at", { ascending: false })
    .limit(4);
  if (error) throw error;
  return data ?? [];
}
