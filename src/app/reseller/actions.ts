"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/authGuard";
import { updateBusinessProfile, updateLogoUrl } from "@/lib/profile";

export async function saveResellerProfile(formData: FormData) {
  const ctx = await getAuthedContext();
  if (!ctx || (ctx.profile.role !== "reseller" && ctx.profile.role !== "admin")) {
    throw new Error("Not authorized.");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  await updateBusinessProfile(ctx.userId, { fullName, businessName, phone });
  revalidatePath("/reseller");
}

export async function saveResellerLogo(formData: FormData) {
  const ctx = await getAuthedContext();
  if (!ctx || (ctx.profile.role !== "reseller" && ctx.profile.role !== "admin")) {
    throw new Error("Not authorized.");
  }

  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  if (!logoUrl) return;

  await updateLogoUrl(ctx.userId, logoUrl);
  revalidatePath("/reseller");
}
