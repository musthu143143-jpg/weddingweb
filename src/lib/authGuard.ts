import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getOrSyncProfile, type AppProfile } from "@/lib/profile";

export interface AuthedContext {
  userId: string;
  email: string | null;
  profile: AppProfile;
}

/** Returns the signed-in Supabase user plus their synced app profile, or null. */
export async function getAuthedContext(): Promise<AuthedContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getOrSyncProfile({
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  });

  return { userId: user.id, email: user.email ?? null, profile };
}

/** The home portal for a given role — used to bounce users to the right dashboard. */
export function homeForRole(role: AppProfile["role"]) {
  if (role === "admin") return "/admin";
  if (role === "reseller") return "/reseller";
  return "/dashboard";
}
