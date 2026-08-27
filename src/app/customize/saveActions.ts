"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/authGuard";
import { getUserInvitation, saveInvitation } from "@/lib/invitations";

export type SaveState = { ok: boolean; message: string };

/**
 * Persists an editor draft onto an invitation the caller owns.
 * Ownership is enforced in the query, so a forged id cannot write to
 * someone else's invitation.
 */
export async function saveInvitationDraft(input: {
  invitationId: string;
  title: string;
  templateSlug: string;
  data: unknown;
  theme: unknown;
}): Promise<SaveState> {
  const ctx = await getAuthedContext();
  if (!ctx) return { ok: false, message: "Please log in to save this invitation to your account." };

  const existing = await getUserInvitation(ctx.userId, input.invitationId);
  if (!existing) return { ok: false, message: "That invitation was not found in your account." };

  await saveInvitation(ctx.userId, input.invitationId, {
    title: input.title || existing.title,
    templateSlug: input.templateSlug,
    data: input.data,
    theme: input.theme,
  });

  ["/dashboard", "/dashboard/invitations"].forEach((p) => revalidatePath(p));
  if (existing.publicSlug) revalidatePath(`/i/${existing.publicSlug}`);
  return { ok: true, message: "Saved to your account." };
}
