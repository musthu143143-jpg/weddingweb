import { createClient } from "@/lib/supabase/client";

/**
 * A single public bucket for all invitation-related media (gallery photos,
 * couple portraits, reseller business logos). Files are namespaced by the
 * owner's Supabase auth user id so Storage RLS policies can restrict writes
 * to "your own folder" while keeping reads public (guests need to view
 * wedding photos without logging in).
 *
 * Run supabase/sql/003_storage.sql in your Supabase SQL editor once to
 * create this bucket and its policies before uploads will work.
 */
export const MEDIA_BUCKET = "invitation-media";

export interface UploadedImage {
  /** Path inside the bucket, used to delete the file later. */
  path: string;
  /** Public URL, safe to store and render directly. */
  url: string;
}

function assertClient() {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase is not connected. Add your project URL and key to the environment.");
  }
  return supabase;
}

function extensionOf(filename: string) {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : "jpg";
}

/**
 * Uploads a single file to `{userId}/{folder}/{random}.{ext}` and returns
 * its public URL. Requires the caller to be authenticated (Storage RLS
 * enforces that users may only write inside their own folder).
 */
export async function uploadInvitationImage(file: File, userId: string, folder: string): Promise<UploadedImage> {
  const supabase = assertClient();
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${extensionOf(file.name)}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function removeInvitationImage(path: string): Promise<void> {
  if (!path) return;
  const supabase = assertClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) throw error;
}
