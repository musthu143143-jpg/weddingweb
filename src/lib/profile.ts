import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles, type userRoleEnum } from "@/db/schema";

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export interface AppProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  businessName: string | null;
  phone: string | null;
  logoUrl: string | null;
}

/** Comma-separated emails that automatically become admins (server-only env). */
function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlistedAdminEmail(email?: string | null) {
  if (!email) return false;
  return adminEmailAllowlist().includes(email.toLowerCase());
}

type SupabaseUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function pickRequestedRole(metadata: Record<string, unknown> | null | undefined): UserRole {
  const requested = metadata?.requested_role;
  return requested === "reseller" ? "reseller" : "user";
}

/**
 * Fetches the caller's app profile, creating it on first visit and
 * re-syncing admin status for allow-listed emails on every call.
 */
export async function getOrSyncProfile(user: SupabaseUserLike): Promise<AppProfile> {
  const email = user.email ?? "";
  const existing = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

  if (existing.length === 0) {
    const role: UserRole = isAllowlistedAdminEmail(email) ? "admin" : pickRequestedRole(user.user_metadata);
    const fullName = typeof user.user_metadata?.full_name === "string" ? (user.user_metadata!.full_name as string) : null;
    const businessName =
      role === "reseller" && typeof user.user_metadata?.business_name === "string"
        ? (user.user_metadata!.business_name as string)
        : null;

    const [created] = await db
      .insert(profiles)
      .values({ id: user.id, email, fullName, role, businessName })
      .onConflictDoNothing({ target: profiles.id })
      .returning();

    if (created) return toAppProfile(created);

    // Someone else created it concurrently — read it back.
    const [row] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
    return toAppProfile(row);
  }

  const current = existing[0];

  // Keep email fresh and promote allow-listed admin emails automatically.
  const shouldPromote = isAllowlistedAdminEmail(email) && current.role !== "admin";
  const emailChanged = email && current.email !== email;

  if (shouldPromote || emailChanged) {
    const [updated] = await db
      .update(profiles)
      .set({
        email: email || current.email,
        role: shouldPromote ? "admin" : current.role,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id))
      .returning();
    return toAppProfile(updated);
  }

  return toAppProfile(current);
}

export async function getProfile(id: string): Promise<AppProfile | null> {
  const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return row ? toAppProfile(row) : null;
}

export async function listProfiles(): Promise<AppProfile[]> {
  const rows = await db.select().from(profiles).orderBy(profiles.createdAt);
  return rows.map(toAppProfile);
}

export async function countByRole(): Promise<Record<UserRole, number>> {
  const rows = await db
    .select({ role: profiles.role, count: sql<number>`count(*)::int` })
    .from(profiles)
    .groupBy(profiles.role);

  const base: Record<UserRole, number> = { user: 0, reseller: 0, admin: 0 };
  for (const r of rows) base[r.role] = r.count;
  return base;
}

export async function countAdmins(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(profiles)
    .where(eq(profiles.role, "admin"));
  return row?.count ?? 0;
}

/**
 * Bootstrap the very first administrator.
 *
 * The UPDATE is guarded by `NOT EXISTS (... role = 'admin')`, evaluated by the
 * database itself, so this can only ever succeed while the platform has zero
 * admins. Once an admin exists, every later attempt is a no-op — there is no
 * window for a second person to also claim ownership.
 */
export async function claimFirstAdmin(id: string): Promise<boolean> {
  const result = await db.execute(sql`
    update ${profiles}
    set role = 'admin', updated_at = now()
    where ${profiles.id} = ${id}
      and not exists (select 1 from ${profiles} p where p.role = 'admin')
    returning ${profiles.id}
  `);
  return (result.rowCount ?? 0) > 0;
}

export async function updateRole(id: string, role: UserRole) {
  const [updated] = await db
    .update(profiles)
    .set({ role, updatedAt: new Date() })
    .where(eq(profiles.id, id))
    .returning();
  return updated ? toAppProfile(updated) : null;
}

export async function updateBusinessProfile(
  id: string,
  data: { fullName?: string; businessName?: string; phone?: string },
) {
  const [updated] = await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.id, id))
    .returning();
  return updated ? toAppProfile(updated) : null;
}

export async function updateLogoUrl(id: string, logoUrl: string) {
  const [updated] = await db
    .update(profiles)
    .set({ logoUrl, updatedAt: new Date() })
    .where(eq(profiles.id, id))
    .returning();
  return updated ? toAppProfile(updated) : null;
}

function toAppProfile(row: typeof profiles.$inferSelect): AppProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: row.role,
    businessName: row.businessName,
    logoUrl: row.logoUrl,
    phone: row.phone,
  };
}
