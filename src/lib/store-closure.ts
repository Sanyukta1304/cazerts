import { supabase } from "@/lib/supabase";
import type { StoreOverride } from "@/lib/store-hours";

export type StoreClosure = StoreOverride & { locationId: string };

// One call returns the admin override for every store.
// A store with no row simply follows the normal opening hours.
export async function getAllStoreClosures(): Promise<StoreClosure[]> {
  const { data, error } = await supabase
    .from("store_closures")
    .select("location_id, is_closed, reason, force_open_until");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    locationId: row.location_id,
    isClosed: !!row.is_closed,
    reason: row.reason ?? "",
    forceOpenUntil: row.force_open_until ?? null,
  }));
}