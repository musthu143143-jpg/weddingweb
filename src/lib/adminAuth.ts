import "server-only";
import { redirect } from "next/navigation";
import { getAuthedContext } from "@/lib/authGuard";
import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Guards every admin route.
 *
 * Non-admins are sent to /admin/access rather than silently bounced to the
 * couple dashboard, so it is always clear *why* access was refused and how to
 * obtain it.
 */
export async function requireAdmin() {
  if (!getSupabaseConfig()) redirect("/admin/login?setup=1");

  const ctx = await getAuthedContext();
  if (!ctx) redirect("/admin/login");
  if (ctx.profile.role !== "admin") redirect("/admin/access");

  return ctx;
}
