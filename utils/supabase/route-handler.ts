import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/utils/supabase/database.types";
import { getSupabasePublicEnv } from "@/utils/supabase/public-env";

/**
 * Route Handlers: use this instead of the cookie-based SSR client so mutations
 * run as the anon role from the publishable key (cookie store is often empty here).
 */
export function createRouteHandlerSupabase(): SupabaseClient<Database> {
  const { url, key } = getSupabasePublicEnv();
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
