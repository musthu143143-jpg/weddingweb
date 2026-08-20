import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { invitations, orders, rsvps } from "@/db/schema";

export type Invitation = typeof invitations.$inferSelect;
export type Rsvp = typeof rsvps.$inferSelect;

const SLUG_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function randomSuffix(length = 5) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => SLUG_ALPHABET[b % SLUG_ALPHABET.length]).join("");
}

/** Builds a unique public slug, retrying on collision. */
export async function uniquePublicSlug(base: string) {
  const root = slugify(base) || "invitation";
  for (let i = 0; i < 6; i += 1) {
    const candidate = `${root}-${randomSuffix()}`;
    const [existing] = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where(eq(invitations.publicSlug, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique share link. Please try again.");
}

export async function listUserInvitations(ownerId: string) {
  return db.select().from(invitations).where(eq(invitations.ownerId, ownerId)).orderBy(desc(invitations.updatedAt));
}

export async function getUserInvitation(ownerId: string, id: string) {
  const [row] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.ownerId, ownerId), eq(invitations.id, id)))
    .limit(1);
  return row ?? null;
}

export async function getPublishedInvitation(publicSlug: string) {
  const [row] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.publicSlug, publicSlug), eq(invitations.published, true)))
    .limit(1);
  return row ?? null;
}

export async function createInvitation(input: {
  ownerId: string;
  title: string;
  templateSlug: string;
  data?: unknown;
  theme?: unknown;
}) {
  const [created] = await db
    .insert(invitations)
    .values({
      ownerId: input.ownerId,
      title: input.title,
      templateSlug: input.templateSlug,
      data: input.data ?? null,
      theme: input.theme ?? null,
      updatedAt: new Date(),
    })
    .returning();
  return created;
}

export async function saveInvitation(
  ownerId: string,
  id: string,
  patch: { title?: string; data?: unknown; theme?: unknown; templateSlug?: string },
) {
  const [updated] = await db
    .update(invitations)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(invitations.ownerId, ownerId), eq(invitations.id, id)))
    .returning();
  return updated ?? null;
}

export async function setPublished(ownerId: string, id: string, published: boolean) {
  const current = await getUserInvitation(ownerId, id);
  if (!current) return null;

  let publicSlug = current.publicSlug;
  if (published && !publicSlug) {
    publicSlug = await uniquePublicSlug(current.title || current.templateSlug);
  }

  const [updated] = await db
    .update(invitations)
    .set({ published, publicSlug, updatedAt: new Date() })
    .where(and(eq(invitations.ownerId, ownerId), eq(invitations.id, id)))
    .returning();
  return updated ?? null;
}

export async function deleteInvitation(ownerId: string, id: string) {
  const [removed] = await db
    .delete(invitations)
    .where(and(eq(invitations.ownerId, ownerId), eq(invitations.id, id)))
    .returning({ id: invitations.id });
  if (removed) await db.delete(rsvps).where(eq(rsvps.invitationId, removed.id));
  return Boolean(removed);
}

/** RSVPs across every invitation the user owns. */
export async function listUserRsvps(ownerId: string) {
  const owned = await db
    .select({ id: invitations.id, title: invitations.title })
    .from(invitations)
    .where(eq(invitations.ownerId, ownerId));

  if (owned.length === 0) return [];

  const rows = await db
    .select()
    .from(rsvps)
    .where(inArray(rsvps.invitationId, owned.map((o) => o.id)))
    .orderBy(desc(rsvps.createdAt));

  const titles = new Map(owned.map((o) => [o.id, o.title]));
  return rows.map((r) => ({ ...r, invitationTitle: titles.get(r.invitationId) ?? "Invitation" }));
}

export async function listUserOrders(ownerId: string, email: string | null) {
  const rows = await db
    .select()
    .from(orders)
    .where(email ? sql`${orders.customerId} = ${ownerId} or ${orders.customerEmail} = ${email}` : eq(orders.customerId, ownerId))
    .orderBy(desc(orders.createdAt));
  return rows;
}

export async function getUserStats(ownerId: string, email: string | null) {
  const [invites, rsvpRows, orderRows] = await Promise.all([
    listUserInvitations(ownerId),
    listUserRsvps(ownerId),
    listUserOrders(ownerId, email),
  ]);

  return {
    invitations: invites,
    total: invites.length,
    published: invites.filter((i) => i.published).length,
    drafts: invites.filter((i) => !i.published).length,
    rsvps: rsvpRows,
    attending: rsvpRows.filter((r) => r.attending).length,
    guests: rsvpRows.filter((r) => r.attending).reduce((sum, r) => sum + (r.guests ?? 0), 0),
    orders: orderRows,
  };
}
