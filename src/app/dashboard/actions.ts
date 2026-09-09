"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthedContext } from "@/lib/authGuard";
import { createInvitation, deleteInvitation, getUserInvitation, saveInvitation, setPublished } from "@/lib/invitations";
import { unlockInvitation, type UnlockResult } from "@/lib/orders";
import { updateBusinessProfile } from "@/lib/profile";
import { TEMPLATES } from "@/data/templates";

function text(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function revalidateDashboard() {
  ["/dashboard", "/dashboard/invitations", "/dashboard/rsvps", "/dashboard/orders", "/dashboard/settings"].forEach((p) =>
    revalidatePath(p),
  );
}

async function requireUser() {
  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function createInvitationAction(formData: FormData) {
  const ctx = await requireUser();
  const templateSlug = text(formData.get("templateSlug")) || TEMPLATES[0].slug;
  const template = TEMPLATES.find((t) => t.slug === templateSlug) ?? TEMPLATES[0];
  const title = text(formData.get("title")) || "Our Wedding";

  const created = await createInvitation({
    ownerId: ctx.userId,
    title,
    templateSlug: template.slug,
    theme: template.theme,
  });

  revalidateDashboard();
  redirect(`/customize/${template.slug}?invitation=${created.id}`);
}

export async function renameInvitationAction(formData: FormData) {
  const ctx = await requireUser();
  const id = text(formData.get("id"));
  const title = text(formData.get("title"));
  if (!id || !title) throw new Error("A title is required.");
  await saveInvitation(ctx.userId, id, { title });
  revalidateDashboard();
}

async function publishForUser(formData: FormData) {
  const ctx = await requireUser();
  const id = text(formData.get("id"));
  const published = text(formData.get("published")) === "true";
  if (!id) throw new Error("Invitation id missing.");

  if (published) {
    const inv = await getUserInvitation(ctx.userId, id);
    if (!inv) throw new Error("That invitation could not be found.");
    if (!inv.unlockedPlan) throw new Error("Order a plan and redeem your unlock key before publishing.");
  }

  const updated = await setPublished(ctx.userId, id, published);
  if (!updated) throw new Error("That invitation could not be found.");
  revalidateDashboard();
  if (updated.publicSlug) revalidatePath(`/i/${updated.publicSlug}`);
  return { publicSlug: updated.publicSlug };
}

/** Form actions must return void; the editor uses the result-returning variant below. */
export async function togglePublishAction(formData: FormData): Promise<void> {
  await publishForUser(formData);
}

export async function publishInvitationAction(formData: FormData) {
  return publishForUser(formData);
}

/**
 * Confirms an offline payment by redeeming a one-time secret key.
 * Returns a result object so the client form can show success/error inline.
 */
export async function unlockInvitationAction(
  _prev: UnlockResult | null,
  formData: FormData,
): Promise<UnlockResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return { ok: false, message: "Please log in first." };

  const result = await unlockInvitation(
    ctx.userId,
    text(formData.get("invitationId")),
    text(formData.get("code")),
  );
  if (result.ok) revalidateDashboard();
  return result;
}

export async function deleteInvitationAction(formData: FormData) {
  const ctx = await requireUser();
  const id = text(formData.get("id"));
  if (!id) throw new Error("Invitation id missing.");
  await deleteInvitation(ctx.userId, id);
  revalidateDashboard();
}

export async function saveProfileAction(formData: FormData) {
  const ctx = await requireUser();
  await updateBusinessProfile(ctx.userId, {
    fullName: text(formData.get("fullName")),
    phone: text(formData.get("phone")),
  });
  revalidateDashboard();
}
