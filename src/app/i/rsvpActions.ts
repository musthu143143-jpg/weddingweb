"use server";

import { revalidatePath } from "next/cache";
import { submitPublicRsvp, type PublicRsvpInput, type PublicRsvpResult } from "@/lib/invitations";

/** Public guest action used by the RSVP form on a published invitation. */
export async function submitRsvpAction(input: PublicRsvpInput): Promise<PublicRsvpResult> {
  try {
    const result = await submitPublicRsvp(input);
    if (result.ok && result.publicSlug) revalidatePath(`/i/${result.publicSlug}`);
    if (result.ok) revalidatePath("/dashboard/rsvps");
    return result;
  } catch {
    return { ok: false, message: "We could not send your response. Please try again." };
  }
}
