import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/utils/supabase/public-env";
import type { Database } from "@/utils/supabase/database.types";

export function createClient(): SupabaseClient<Database> {
  const { url, key } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, key);
}
