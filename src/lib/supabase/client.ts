import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  const config = getSupabaseConfig();
  if (!config) return null;

  browserClient = createBrowserClient(config.url, config.key);
  return browserClient;
}
