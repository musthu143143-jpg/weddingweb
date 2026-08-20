import "server-only";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupons, invitations, orders, profiles, rsvps, templates } from "@/db/schema";
import { TEMPLATES } from "@/data/templates";
import type { WeddingTemplate } from "@/lib/types";

export type AdminTemplate = typeof templates.$inferSelect;
export type AdminOrder = typeof orders.$inferSelect;

export async function getAdminOverview() {
  const [profileRows, templateCount, invitationCount, rsvpCount, orderRows, recentProfiles, recentOrders, couponRows] = await Promise.all([
    db.select({ role: profiles.role, count: sql<number>`count(*)::int` }).from(profiles).groupBy(profiles.role),
    db.select({ count: sql<number>`count(*)::int` }).from(templates),
    db.select({ count: sql<number>`count(*)::int` }).from(invitations),
    db.select({ count: sql<number>`count(*)::int` }).from(rsvps),
    db.select({ status: orders.status, count: sql<number>`count(*)::int`, revenue: sql<number>`coalesce(sum(${orders.amount}),0)::int` }).from(orders).groupBy(orders.status),
    db.select().from(profiles).orderBy(desc(profiles.createdAt)).limit(5),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
    db.select().from(coupons),
  ]);

  const nowTs = Date.now();
  const couponSummary = {
    total: couponRows.length,
    redeemed: couponRows.filter((c) => c.redeemedAt !== null).length,
    active: couponRows.filter(
      (c) => !c.redeemedAt && c.active && c.startsAt.getTime() <= nowTs && c.expiresAt.getTime() > nowTs,
    ).length,
  };

  const roles = { user: 0, reseller: 0, admin: 0 };
  profileRows.forEach((r) => { roles[r.role] = r.count; });

  const orderStatus = { pending: 0, paid: 0, fulfilled: 0, cancelled: 0 };
  let revenue = 0;
  orderRows.forEach((r) => {
    orderStatus[r.status as keyof typeof orderStatus] = r.count;
    revenue += r.revenue;
  });

  return {
    roles,
    totalProfiles: roles.user + roles.reseller + roles.admin,
    templates: templateCount[0]?.count ?? 0,
    invitations: invitationCount[0]?.count ?? 0,
    rsvps: rsvpCount[0]?.count ?? 0,
    orders: orderStatus,
    revenue,
    recentProfiles,
    recentOrders,
    coupons: couponSummary,
  };
}

export async function listAdminTemplates(query?: string) {
  const q = query?.trim();
  if (!q) return db.select().from(templates).orderBy(desc(templates.createdAt));
  return db
    .select()
    .from(templates)
    .where(or(ilike(templates.name, `%${q}%`), ilike(templates.slug, `%${q}%`)))
    .orderBy(desc(templates.createdAt));
}

export async function getAdminTemplate(id: string) {
  const [row] = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return row ?? null;
}

export async function upsertTemplateFromStatic(template: WeddingTemplate) {
  await db
    .insert(templates)
    .values({
      slug: template.slug,
      name: template.name,
      tagline: template.tagline,
      description: template.description,
      categories: template.categories,
      style: template.style,
      price: template.price,
      premium: template.premium,
      image: template.image,
      imageAlt: template.imageAlt,
      theme: template.theme,
      features: template.features,
      sections: template.sections,
      status: "published",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: templates.slug,
      set: {
        name: template.name,
        tagline: template.tagline,
        description: template.description,
        categories: template.categories,
        style: template.style,
        price: template.price,
        premium: template.premium,
        image: template.image,
        imageAlt: template.imageAlt,
        theme: template.theme,
        features: template.features,
        sections: template.sections,
        status: "published",
        updatedAt: new Date(),
      },
    });
}

export async function seedStaticTemplates() {
  for (const template of TEMPLATES) await upsertTemplateFromStatic(template);
}

export async function createAdminTemplate(input: Omit<typeof templates.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const [created] = await db.insert(templates).values({ ...input, updatedAt: new Date() }).returning();
  return created;
}

export async function updateAdminTemplate(id: string, input: Partial<typeof templates.$inferInsert>) {
  const [updated] = await db.update(templates).set({ ...input, updatedAt: new Date() }).where(eq(templates.id, id)).returning();
  return updated ?? null;
}

export async function deleteAdminTemplate(id: string) {
  await db.delete(templates).where(eq(templates.id, id));
}

export async function listOrders(query?: string) {
  const q = query?.trim();
  if (!q) return db.select().from(orders).orderBy(desc(orders.createdAt));
  return db
    .select()
    .from(orders)
    .where(or(ilike(orders.customerEmail, `%${q}%`), ilike(orders.plan, `%${q}%`), ilike(orders.status, `%${q}%`)))
    .orderBy(desc(orders.createdAt));
}

export async function createOrder(input: typeof orders.$inferInsert) {
  const [created] = await db.insert(orders).values({ ...input, updatedAt: new Date() }).returning();
  return created;
}

export async function updateOrderStatus(id: string, status: string) {
  const [updated] = await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
  return updated ?? null;
}

export async function deleteOrder(id: string) {
  await db.delete(orders).where(eq(orders.id, id));
}

export async function listCustomers(query?: string) {
  const q = query?.trim();
  if (!q) return db.select().from(profiles).orderBy(desc(profiles.createdAt));
  return db
    .select()
    .from(profiles)
    .where(or(ilike(profiles.email, `%${q}%`), ilike(profiles.fullName, `%${q}%`), ilike(profiles.businessName, `%${q}%`)))
    .orderBy(desc(profiles.createdAt));
}

export async function getOperationalAnalytics() {
  const overview = await getAdminOverview();
  const [publishedTemplates, premiumTemplates, publishedInvitations] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(templates).where(eq(templates.status, "published")),
    db.select({ count: sql<number>`count(*)::int` }).from(templates).where(eq(templates.premium, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(invitations).where(eq(invitations.published, true)),
  ]);

  return {
    ...overview,
    publishedTemplates: publishedTemplates[0]?.count ?? 0,
    premiumTemplates: premiumTemplates[0]?.count ?? 0,
    publishedInvitations: publishedInvitations[0]?.count ?? 0,
  };
}

export function csv(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseTheme(value: FormDataEntryValue | null, fallback: unknown) {
  try {
    return JSON.parse(String(value ?? ""));
  } catch {
    return fallback;
  }
}
