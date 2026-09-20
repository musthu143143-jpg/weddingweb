"use client";

import JSZip from "jszip";
import { FileArchive, LoaderCircle, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadInvitationImage } from "@/lib/supabase/storage";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { importTemplatePackageAction } from "@/app/admin/actions";

type PackageResult = { ok: boolean; message: string; name?: string; slug?: string };

/**
 * Imports a safe, declarative template package. It reads template.json and
 * uploads only the package preview image; JSX/HTML/JS is never executed on
 * the server.
 */
export default function TemplatePackageUploader({ userId }: { userId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PackageResult | null>(null);

  async function importPackage(file: File) {
    setBusy(true);
    setResult(null);
    try {
      const zip = await JSZip.loadAsync(file);
      const manifestEntry = zip.file("template.json") ?? zip.file("manifest.json") ?? zip.file("template/manifest.json");
      if (!manifestEntry) throw new Error("Package must include template.json at its root.");

      const manifest = JSON.parse(await manifestEntry.async("text")) as Record<string, unknown>;
      const source = (manifest.template && typeof manifest.template === "object" ? manifest.template : manifest) as Record<string, unknown>;
      const slug = String(source.slug ?? "").trim().toLowerCase();
      if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Use a lowercase URL slug such as royal-mandap.");
      if (!String(source.name ?? "").trim()) throw new Error("The package needs a template name.");

      let image = typeof source.image === "string" ? source.image : "";
      const previewPath = Object.keys(zip.files).find((path) => /(^|\/)(preview|cover)\.(png|jpe?g|webp)$/i.test(path));
      if (previewPath) {
        if (!isSupabaseConfigured()) throw new Error("Supabase Storage must be configured to upload a package preview image.");
        const entry = zip.file(previewPath);
        if (!entry) throw new Error("The preview image could not be read.");
        const blob = await entry.async("blob");
        const uploaded = await uploadInvitationImage(new File([blob], previewPath.split("/").pop() ?? "preview.webp", { type: blob.type || "image/webp" }), userId, `templates/${slug}`);
        image = uploaded.url;
      }

      const payload = {
        ...source,
        slug,
        image: image || "/images/hero-mandap.jpg",
        imageAlt: String(source.imageAlt ?? `${String(source.name)} wedding invitation`),
      };
      const response = await importTemplatePackageAction(JSON.stringify(payload));
      setResult(response);
      if (response.ok) {
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      }
    } catch (caught) {
      setResult({ ok: false, message: caught instanceof Error ? caught.message : "Could not import this package." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gold/20 bg-gold-pale/30 p-4 font-sans text-[12px] leading-relaxed text-ink-soft/75">
        Upload a ZIP containing a <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[11px]">template.json</code> manifest and an optional <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[11px]">preview.webp</code>, <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[11px]">preview.png</code>, or <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[11px]">preview.jpg</code>. The package is declarative and safe: uploaded code is not executed in the live app.
      </div>
      <input ref={inputRef} type="file" accept=".zip,application/zip" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importPackage(file); }} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-burgundy px-6 py-3 font-sans text-[11px] uppercase tracking-wide-2 text-ivory shadow-md transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        {busy ? "Importing package…" : "Upload template package"}
      </button>
      <p className="flex items-center gap-2 font-sans text-[11px] text-ink-soft/55"><FileArchive className="h-3.5 w-3.5" /> Assets are stored in Supabase Storage; the template becomes a draft record for review.</p>
      {result && (
        <div className={`rounded-xl border px-4 py-3 font-sans text-[12px] ${result.ok ? "border-sage/40 bg-sage/10 text-sage" : "border-maroon/30 bg-maroon/5 text-maroon"}`} role="status">
          {result.ok ? (
            <>
              <strong className="font-medium">“{result.name ?? "Template"}” added successfully.</strong>{" "}
              It is now available in the template list as a draft for review.
            </>
          ) : result.message}
        </div>
      )}
    </div>
  );
}
