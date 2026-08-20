"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createCoupon, deleteCoupon, redeemCoupon, redeemMessage, setCouponActive } from "@/lib/coupons";

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function revalidateCoupons() {
  ["/admin", "/admin/coupons", "/admin/analytics"].forEach((p) => revalidatePath(p));
}

function parseDate(value: string, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export async function createCouponAction(formData: FormData) {
  const ctx = await requireAdmin();

  const discountType = text(formData.get("discountType")) === "amount" ? "amount" : "percent";
  const discountValue = Number(formData.get("discountValue") ?? 0);

  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new Error("Discount value must be greater than zero.");
  }
  if (discountType === "percent" && discountValue > 100) {
    throw new Error("Percentage discount cannot exceed 100.");
  }

  const now = new Date();
  const startsAt = parseDate(text(formData.get("startsAt")), now);
  const defaultExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiresAt = parseDate(text(formData.get("expiresAt")), defaultExpiry);

  if (expiresAt.getTime() <= startsAt.getTime()) {
    throw new Error("Expiry must be after the start time.");
  }

  await createCoupon({
    code: text(formData.get("code")) || undefined,
    description: text(formData.get("description")) || null,
    discountType,
    discountValue: Math.round(discountValue),
    startsAt,
    expiresAt,
    active: text(formData.get("active")) !== "false",
    createdBy: ctx.userId,
  });

  revalidateCoupons();
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  const active = text(formData.get("active")) === "true";
  if (!id) throw new Error("Coupon id missing.");
  await setCouponActive(id, active);
  revalidateCoupons();
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) throw new Error("Coupon id missing.");
  await deleteCoupon(id);
  revalidateCoupons();
}

/** Admin-side validation/redemption tool, proving one-time use behaviour. */
export async function redeemCouponAction(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  const code = text(formData.get("code"));
  if (!code) throw new Error("Enter a coupon code to redeem.");

  const result = await redeemCoupon(code, text(formData.get("redeemedBy")) || ctx.email);
  revalidateCoupons();

  if (!result.ok) throw new Error(redeemMessage(result));
}
