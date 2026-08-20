"use client";

import { useState, useTransition } from "react";
import { Check, LoaderCircle } from "lucide-react";
import ImageUploader, { type UploadedImage } from "@/components/media/ImageUploader";
import { saveResellerLogo } from "@/app/reseller/actions";

export default function LogoUploader({ userId, initialUrl }: { userId: string; initialUrl: string | null }) {
  const [images, setImages] = useState<UploadedImage[]>(initialUrl ? [{ url: initialUrl, path: "" }] : []);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function handleChange(next: UploadedImage[]) {
    const latest = next[next.length - 1];
    setImages(latest ? [latest] : []);
    if (!latest) return;

    const formData = new FormData();
    formData.set("logoUrl", latest.url);
    startTransition(async () => {
      await saveResellerLogo(formData);
      setSavedAt(Date.now());
    });
  }

  return (
    <div>
      <ImageUploader
        userId={userId}
        folder="logo"
        images={images}
        onChange={handleChange}
        multiple={false}
        label={images.length ? "Replace business logo" : "Upload business logo"}
      />
      {pending && (
        <p className="mt-2 inline-flex items-center gap-1.5 font-sans text-[11px] text-ink-soft/60">
          <LoaderCircle className="h-3 w-3 animate-spin" /> Saving to your profile…
        </p>
      )}
      {!pending && savedAt && (
        <p className="mt-2 inline-flex items-center gap-1.5 font-sans text-[11px] text-sage">
          <Check className="h-3 w-3" strokeWidth={2} /> Logo saved
        </p>
      )}
    </div>
  );
}
