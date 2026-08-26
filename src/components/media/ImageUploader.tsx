"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ImagePlus, LoaderCircle, Music2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { removeInvitationImage, uploadInvitationImage, type UploadedImage } from "@/lib/supabase/storage";

export type { UploadedImage };

export type UploaderKind = "image" | "audio";

const DEFAULTS: Record<UploaderKind, { accept: string; validate: (f: File) => boolean; label: string; preview: boolean }> = {
  image: {
    accept: "image/*",
    validate: (f) => f.type.startsWith("image/"),
    label: "Upload photos",
    preview: true,
  },
  audio: {
    accept: "audio/*,.mp3,.m4a,.wav,.ogg",
    validate: (f) => f.type.startsWith("audio/") || /\.(mp3|m4a|wav|ogg|aac)$/i.test(f.name),
    label: "Upload music",
    preview: false,
  },
};

/**
 * Uploads files to Supabase Storage under `{userId}/{folder}/`. Works for
 * images (thumbnails) and audio (file chips). The parent owns the resulting
 * list, so the same widget powers galleries, couple photos and music.
 */
export default function ImageUploader({
  userId,
  folder,
  images,
  onChange,
  label,
  multiple = true,
  maxFiles = 6,
  kind = "image",
  hint,
}: {
  /** Supabase auth user id — files are namespaced under this folder. */
  userId: string;
  /** Sub-folder for this upload context, e.g. "gallery", "photos", "music". */
  folder: string;
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
  kind?: UploaderKind;
  hint?: string;
}) {
  const config = DEFAULTS[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    if (!isSupabaseConfigured()) {
      setError("Supabase Storage is not connected yet. Add your project URL and key to the environment.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const files = Array.from(fileList).filter(config.validate).slice(0, multiple ? maxFiles : 1);

      if (files.length === 0) {
        setError(kind === "audio" ? "Please choose an audio file (mp3, m4a, wav, ogg)." : "Please choose an image file.");
        return;
      }

      const uploaded: UploadedImage[] = [];
      for (const file of files) {
        uploaded.push(await uploadInvitationImage(file, userId, folder));
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded);
    } catch (caught) {
      const message = (caught as { message?: string }).message;
      setError(
        message?.includes("Bucket not found")
          ? "Storage bucket not found. Run supabase/sql/003_storage.sql in your Supabase project first."
          : message?.includes("mime type") || message?.includes("invalid mime")
            ? "That file type is not allowed by the storage bucket policy."
            : message || "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(img: UploadedImage) {
    onChange(images.filter((i) => i.path !== img.path));
    try {
      await removeInvitationImage(img.path);
    } catch {
      // Best-effort delete — the file will simply become unreferenced.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-gold/50 px-4 py-3.5 font-sans text-[11px] uppercase tracking-wide-2 text-burgundy transition-colors hover:bg-gold/10 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} /> : kind === "audio" ? <Music2 className="h-4 w-4" strokeWidth={1.8} /> : <ImagePlus className="h-4 w-4" strokeWidth={1.8} />}
        {busy ? "Uploading…" : label ?? config.label}
      </button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 rounded-lg border border-maroon/25 bg-maroon/5 px-3 py-2.5 text-maroon"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
            <p className="font-sans text-[11.5px] leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {images.length > 0 && config.preview && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.path || img.url} className="group relative aspect-square overflow-hidden rounded-lg border border-gold/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Uploaded to your Supabase storage" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(img)}
                aria-label="Remove image"
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/70 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && !config.preview && (
        <div className="space-y-2">
          {images.map((img) => (
            <div key={img.path || img.url} className="flex items-center gap-3 rounded-lg border border-gold/20 bg-white/70 px-3 py-2">
              <Music2 className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.8} />
              <audio controls src={img.url} className="h-9 min-w-0 flex-1" />
              <button type="button" onClick={() => handleRemove(img)} aria-label="Remove file" className="shrink-0 text-maroon">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="font-sans text-[10.5px] font-light text-ink-soft/50">{hint ?? "Stored securely in your Supabase project storage."}</p>
    </div>
  );
}
