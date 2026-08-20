import "server-only";
import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";

export type Coupon = typeof coupons.$inferSelect;
export type CouponStatus = "active" | "scheduled" | "redeemed" | "expired" | "disabled";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing 0/O/1/I

export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function generateCouponCode(prefix = "CEL", length = 8) {
  let body = "";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i += 1) body += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `${normalizeCode(prefix)}-${body}`;
}

export function couponStatus(coupon: Coupon, now = new Date()): CouponStatus {
  if (coupon.redeemedAt) return "redeemed";
  if (!coupon.active) return "disabled";
  if (coupon.expiresAt.getTime() <= now.getTime()) return "expired";
  if (coupon.startsAt.getTime() > now.getTime()) return "scheduled";
  return "active";
}

export async function listCoupons(query?: string) {
  const q = query?.trim();
  if (!q) return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return db
    .select()
    .from(coupons)
    .where(or(ilike(coupons.code, `%${q}%`), ilike(coupons.description, `%${q}%`)))
    .orderBy(desc(coupons.createdAt));
}

export async function couponStats() {
  const rows = await db.select().from(coupons);
  const now = new Date();
  const stats = { total: rows.length, active: 0, redeemed: 0, expired: 0, scheduled: 0, disabled: 0 };
  rows.forEach((c) => {
    stats[couponStatus(c, now)] += 1;
  });
  return stats;
}

/** Creates a coupon, retrying if a generated code collides with an existing unique code. */
export async function createCoupon(input: {
  code?: string;
  description?: string | null;
  discountType: "percent" | "amount";
  discountValue: number;
  startsAt: Date;
  expiresAt: Date;
  active: boolean;
  createdBy: string;
}) {
  const explicit = input.code ? normalizeCode(input.code) : null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = explicit ?? generateCouponCode();
    const existing = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, code)).limit(1);

    if (existing.length > 0) {
      if (explicit) throw new Error(`Coupon code "${code}" already exists. Codes must be unique.`);
      continue;
    }

    const [created] = await db
      .insert(coupons)
      .values({
        code,
        description: input.description ?? null,
        discountType: input.discountType,
        discountValue: input.discountValue,
        startsAt: input.startsAt,
        expiresAt: input.expiresAt,
        active: input.active,
        createdBy: input.createdBy,
        updatedAt: new Date(),
      })
      .onConflictDoNothing({ target: coupons.code })
      .returning();

    if (created) return created;
    if (explicit) throw new Error(`Coupon code "${code}" already exists. Codes must be unique.`);
  }

  throw new Error("Could not generate a unique coupon code. Please try again.");
}

export async function setCouponActive(id: string, active: boolean) {
  const [updated] = await db
    .update(coupons)
    .set({ active, updatedAt: new Date() })
    .where(eq(coupons.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteCoupon(id: string) {
  await db.delete(coupons).where(eq(coupons.id, id));
}

export type RedeemResult =
  | { ok: true; coupon: Coupon }
  | { ok: false; reason: "not_found" | "already_redeemed" | "expired" | "not_started" | "disabled" };

/**
 * Atomically redeems a coupon exactly once.
 * The UPDATE only matches rows that are still unredeemed, active and inside
 * the validity window, so concurrent redemptions cannot double-spend a code.
 */
export async function redeemCoupon(rawCode: string, redeemedBy?: string | null): Promise<RedeemResult> {
  const code = normalizeCode(rawCode);
  const now = new Date();

  const [existing] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  if (!existing) return { ok: false, reason: "not_found" };

  const [updated] = await db
    .update(coupons)
    .set({ redeemedAt: now, redeemedBy: redeemedBy ?? null, updatedAt: now })
    .where(
      and(
        eq(coupons.code, code),
        isNull(coupons.redeemedAt),
        eq(coupons.active, true),
        sql`${coupons.startsAt} <= ${now}`,
        sql`${coupons.expiresAt} > ${now}`,
      ),
    )
    .returning();

  if (updated) return { ok: true, coupon: updated };

  const status = couponStatus(existing, now);
  if (status === "redeemed") return { ok: false, reason: "already_redeemed" };
  if (status === "expired") return { ok: false, reason: "expired" };
  if (status === "scheduled") return { ok: false, reason: "not_started" };
  return { ok: false, reason: "disabled" };
}

export function redeemMessage(result: RedeemResult) {
  if (result.ok) return `Coupon ${result.coupon.code} redeemed successfully.`;
  switch (result.reason) {
    case "not_found":
      return "That coupon code does not exist.";
    case "already_redeemed":
      return "This coupon has already been used. Each coupon is valid for one use only.";
    case "expired":
      return "This coupon has expired.";
    case "not_started":
      return "This coupon is not active yet.";
    default:
      return "This coupon has been disabled.";
  }
}
