"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthedContext } from "@/lib/authGuard";
import { claimFirstAdmin, countAdmins } from "@/lib/profile";

/**
 * Lets the signed-in user become the first administrator, but only while the
 * platform genuinely has no admin yet. The guard is enforced in SQL.
 */
export async function claimAdminAction() {
  const ctx = await getAuthedContext();
  if (!ctx) redirect("/admin/login");

  if ((await countAdmins()) > 0) {
    throw new Error("An administrator already exists. Ask them to promote your account.");
  }

  const claimed = await claimFirstAdmin(ctx.userId);
  if (!claimed) {
    throw new Error("Admin access could not be granted — an administrator already exists.");
  }

  ["/admin", "/admin/access", "/admin/customers", "/dashboard"].forEach((p) => revalidatePath(p));
  redirect("/admin");
}
