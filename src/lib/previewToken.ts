import type { InvitationData, TemplateTheme } from "@/lib/types";

/**
 * Compact payload carried in a `?preview=` query string so the static
 * template demo page can render the editor's current draft instead of the
 * fixed DEMO_INVITATION. The payload is intentionally shallow — only the
 * caller's live theme override and the invitation data.
 */
export interface PreviewPayload {
  data: Partial<InvitationData>;
  theme?: Partial<TemplateTheme>;
}

/** Browser-safe base64url (works in Node, Edge, and DOM). */
function toBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  const binary =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/**
 * Encodes the payload to a base64url string. Returns null only on failure;
 * callers should keep the payload small via `diffInvitation` so links stay
 * short even with many uploaded (long-URL) assets.
 */
export function encodePreview(payload: PreviewPayload): string | null {
  try {
    const token = toBase64Url(JSON.stringify(payload));
    if (token.length > 14000) return null;
    return token;
  } catch {
    return null;
  }
}

/**
 * Returns only the top-level fields of `next` that differ from `base`.
 * Sending just the diff keeps preview tokens tiny — critical, because the
 * full demo payload plus a few Supabase Storage URLs used to blow past URL
 * limits and silently drop the preview (e.g. couple photos not appearing).
 */
export function diffInvitation(base: InvitationData, next: InvitationData): Partial<InvitationData> {
  const patch: Partial<InvitationData> = {};
  (Object.keys(next) as (keyof InvitationData)[]).forEach((key) => {
    if (JSON.stringify(next[key]) !== JSON.stringify(base[key])) {
      (patch as Record<string, unknown>)[key] = next[key];
    }
  });
  return patch;
}

export function decodePreview(token: string | undefined | null): PreviewPayload | null {
  if (!token) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as PreviewPayload;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Merges a partial preview draft over a base invitation record.
 * Preserves shape so nested lists never become undefined.
 */
export function mergeInvitation(base: InvitationData, patch: Partial<InvitationData> | undefined): InvitationData {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    couple: { ...base.couple, ...(patch.couple ?? {}) },
    venue: { ...base.venue, ...(patch.venue ?? {}) },
    music: { ...base.music, ...(patch.music ?? {}) },
    photos: { ...base.photos, ...(patch.photos ?? {}) },
    sections: { ...base.sections, ...(patch.sections ?? {}) },
    family: {
      her: patch.family?.her?.length ? patch.family.her : base.family.her,
      him: patch.family?.him?.length ? patch.family.him : base.family.him,
    },
    events: patch.events?.length ? patch.events : base.events,
    story: patch.story?.length ? patch.story : base.story,
    gallery: patch.gallery?.length ? patch.gallery : base.gallery,
  };
}
