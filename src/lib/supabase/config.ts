export type SupabaseConfig = {
  url: string;
  key: string;
};

/**
 * Supports the current Supabase publishable key and the older anon-key name
 * so existing deployments can migrate without changing application code.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return { url, key };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}
