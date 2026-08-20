import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invitations, orders, profiles, unlockKeys } from "@/db/schema";
import { findTemplate } from "@/lib/templatesService";

export type UnlockKey = typeof unlockKeys.$inferSelect;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function normalizeKey(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

function generateKeyCode(prefix: string) {
  const bodyLen = 8;
  const bytes = new Uint32Array(bodyLen);
  crypto.getRandomValues(bytes);
  let body = "";
  for (let i = 0; i < bodyLen; i += 1) body += ALPHABET[bytes[i] % ALPHABET.length];
  return `KEY-${prefix.slice(0, 4).toUpperCase()}-${body}`;
}

/* ------------------------------- admin side ------------------------------- */

export async function createUnlockKeys(input: {
  templateSlug?: string | null;
  amount: number;
  count: number;
  createdBy: string;
  note?: string | null;
}) {
  const created: UnlockKey[] = [];
  for (let i = 0; i < Math.min(25, Math.max(1, input.count)); i += 1) {
    const code = generateKeyCode(input.templateSlug ?? "any");
    const [row] = await db
      .insert(unlockKeys)
      .values({
        code,
        plan: "custom",
        templateSlug: input.templateSlug ?? null,
        amount: input.amount,
        note: input.note ?? null,
        createdBy: input.createdBy,
        updatedAt: new Date(),
      })
      .onConflictDoNothing({ target: unlockKeys.code })
      .returning();
    if (row) created.push(row);
  }
  return created;
}

export async function listUnlockKeys() {
  return db.select().from(unlockKeys).orderBy(desc(unlockKeys.createdAt));
}

export async function revokeUnlockKey(id: string) {
  const [row] = await db
    .update(unlockKeys)
    .set({ status: "revoked", updatedAt: new Date() })
    .where(and(eq(unlockKeys.id, id), eq(unlockKeys.status, "available")))
    .returning();
  return row ?? null;
}

/* ------------------------------ customer side ----------------------------- */

export interface UnlockResult {
  ok: boolean;
  message: string;
}

/**
 * Redeems a secret key against one of the caller's invitations.
 * Atomic: the key is consumed, the invitation is unlocked and a paid order is
 * recorded in a single transaction — a key can never be double-spent.
 */
export async function unlockInvitation(
  ownerId: string,
  invitationId: string,
  rawCode: string,
): Promise<UnlockResult> {
  const code = normalizeKey(rawCode);
  if (!code) return { ok: false, message: "Enter your unlock key." };

  try {
    return await db.transaction(async (tx) => {
      const [invitation] = await tx
        .select()
        .from(invitations)
        .where(and(eq(invitations.id, invitationId), eq(invitations.ownerId, ownerId)))
        .limit(1);
      if (!invitation) return { ok: false, message: "That invitation was not found in your account." };
      if (invitation.unlockedPlan) return { ok: false, message: "This invitation is already unlocked." };

      const template = await findTemplate(invitation.templateSlug);
      const required = template?.price ?? 0;

      const [key] = await tx.select().from(unlockKeys).where(eq(unlockKeys.code, code)).limit(1);
      if (!key) return { ok: false, message: "That key does not exist. Check it and try again." };
      if (key.status === "used") return { ok: false, message: "This key has already been used. Each key unlocks one invitation." };
      if (key.status === "revoked") return { ok: false, message: "This key has been revoked. Contact support." };
      if (key.templateSlug && key.templateSlug !== invitation.templateSlug)
        return { ok: false, message: `This key was issued for the “${key.templateSlug}” design and cannot unlock this invitation.` };
      if (key.amount !== required)
        return { ok: false, message: `This key covers ${formatINR(key.amount)}, but this design costs ${formatINR(required)}. Contact support.` };

      const [consumed] = await tx
        .update(unlockKeys)
        .set({ status: "used", usedBy: ownerId, usedInvitationId: invitationId, usedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(unlockKeys.id, key.id), eq(unlockKeys.status, "available")))
        .returning();
      if (!consumed) return { ok: false, message: "This key was just used by someone else. Contact support." };

      await tx
        .update(invitations)
        .set({ unlockedPlan: String(key.amount), updatedAt: new Date() })
        .where(eq(invitations.id, invitationId));

      const [profile] = await tx.select({ email: profiles.email }).from(profiles).where(eq(profiles.id, ownerId)).limit(1);

      await tx.insert(orders).values({
        customerId: ownerId,
        customerEmail: profile?.email ?? "unknown",
        templateSlug: invitation.templateSlug,
        plan: invitation.templateSlug,
        amount: key.amount,
        status: "paid",
        notes: `Unlocked with key ${code}`,
        updatedAt: new Date(),
      });

      return { ok: true, message: `Payment of ${formatINR(key.amount)} confirmed — publishing unlocked.` };
    });
  } catch {
    return { ok: false, message: "Something went wrong while unlocking. Please try again." };
  }
}
