"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Download,
  Eye,
  Gift,
  Heart,
  Image as ImageIcon,
  Mail,
  MapPin,
  Music2,
  Palette,
  Plus,
  Rocket,
  Save,
  ListChecks,
  Sparkles,
  Trash2,
  Undo2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { InvitationData, SectionKey, StoryMoment, TemplateTheme, WeddingEvent, WeddingTemplate } from "@/lib/types";
import { BRAND, DEMO_INVITATION } from "@/data/content";
import { Monogram, Ornament } from "@/components/ui/core";
import MiniPreview from "@/components/invitation/MiniPreview";
import ImageUploader, { type UploadedImage } from "@/components/media/ImageUploader";
import { diffInvitation, encodePreview } from "@/lib/previewToken";
import { useSupabaseUser } from "@/lib/supabase/useUser";
import { saveInvitationDraft, type SaveState } from "@/app/customize/saveActions";
import { publishInvitationAction } from "@/app/dashboard/actions";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SectionId =
  | "couple"
  | "sections"
  | "story"
  | "events"
  | "gallery"
  | "venue"
  | "rsvp"
  | "music"
  | "family"
  | "travel"
  | "gifts"
  | "theme";

const ALL_SECTIONS_ON: Record<SectionKey, boolean> = {
  story: true, events: true, gallery: true, venue: true, countdown: true,
  rsvp: true, music: true, family: true, travel: true, gifts: true,
};

type DraftInvitation = InvitationData & {
  sections: Record<SectionKey, boolean>;
  photos: { bride: string; groom: string };
  rsvp: {
    enabled: boolean;
    prompt: string;
    acceptLabel: string;
    declineLabel: string;
    note: string;
  };
  music: InvitationData["music"] & {
    enabled: boolean;
    url: string;
  };
};

type EditorDraft = {
  templateId: string;
  templateSlug: string;
  theme: TemplateTheme;
  data: DraftInvitation;
  uploadedGallery: UploadedImage[];
  lastSavedAt?: string;
};

const SECTIONS: { id: SectionId; label: string; icon: typeof Heart }[] = [
  { id: "couple", label: "Couple", icon: Heart },
  { id: "sections", label: "Sections", icon: ListChecks },
  { id: "story", label: "Story", icon: Sparkles },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "venue", label: "Venue", icon: MapPin },
  { id: "rsvp", label: "RSVP", icon: Mail },
  { id: "music", label: "Music", icon: Music2 },
  { id: "family", label: "Family", icon: Users },
  { id: "travel", label: "Travel", icon: MapPin },
  { id: "gifts", label: "Gifts", icon: Gift },
  { id: "theme", label: "Theme", icon: Palette },
];

function makeDraft(template: WeddingTemplate, initialData?: unknown, initialTheme?: unknown): EditorDraft {
  const source = initialData && typeof initialData === "object" ? initialData as Partial<DraftInvitation> : {};
  const sourceTheme = initialTheme && typeof initialTheme === "object" ? initialTheme as Partial<TemplateTheme> : {};
  const base = structuredClone(DEMO_INVITATION);

  return {
    templateId: template.id,
    templateSlug: template.slug,
    theme: { ...template.theme, ...sourceTheme },
    data: {
      ...base,
      ...source,
      couple: { ...base.couple, ...(source.couple ?? {}) },
      sections: { ...ALL_SECTIONS_ON, ...(source.sections ?? {}) },
      photos: { bride: source.photos?.bride ?? "", groom: source.photos?.groom ?? "" },
      events: source.events ?? base.events,
      story: source.story ?? base.story,
      gallery: source.gallery ?? base.gallery,
      family: {
        her: source.family?.her ?? base.family.her,
        him: source.family?.him ?? base.family.him,
      },
      venue: { ...base.venue, ...(source.venue ?? {}) },
      music: { ...base.music, ...(source.music ?? {}), enabled: source.music?.enabled ?? true, url: source.music?.url ?? "" },
      rsvp: {
        enabled: true,
        prompt: "Will you celebrate with us?",
        acceptLabel: "Joyfully Accept",
        declineLabel: "Regretfully Decline",
        note: "Your response helps us plan every seat with love.",
        ...(source.rsvp ?? {}),
      },
    },
    uploadedGallery: [],
  };
}

function palettePresets(t: TemplateTheme): { name: string; theme: TemplateTheme }[] {
  return [
    { name: "Original", theme: t },
    {
      name: "Ivory Light",
      theme: { ...t, bg: "#F6F0E1", panel: "#FCF8EE", ink: "#3E2E20", accent: "#8C1F35", gold: "#AC884A", script: "#5E1124", dark: false },
    },
    {
      name: "Royal Burgundy",
      theme: { ...t, bg: "#470C1B", panel: "#F6ECD8", ink: "#4A0D1C", accent: "#8C1F35", gold: "#C6A15B", script: "#5E1124", ornament: "royal", dark: true },
    },
    {
      name: "Midnight",
      theme: { ...t, bg: "#141210", panel: "#1C1916", ink: "#EDE6D8", accent: "#9A938A", gold: "#C9B98F", script: "#E8DFC9", dark: true },
    },
    {
      name: "Blush Garden",
      theme: { ...t, bg: "#FBF4F1", panel: "#FFFAF7", ink: "#5A4038", accent: "#C98A8A", gold: "#B98A6E", script: "#B06A6A", ornament: "floral", dark: false },
    },
  ];
}

function storageKey(slug: string) {
  return `celebrates-editor-draft:${slug}`;
}

/* -------------------------------------------------------------------------- */
/* Main editor                                                                */
/* -------------------------------------------------------------------------- */

type EditorProps = {
  template: WeddingTemplate;
  invitationId?: string;
  invitationTitle?: string;
  /** Saved account data used when the editor is opened on another device. */
  initialData?: unknown;
  initialTheme?: unknown;
};

export default function Editor({ template, invitationId, invitationTitle, initialData, initialTheme }: EditorProps) {
  const { user } = useSupabaseUser();
  const [open, setOpen] = useState<SectionId>("couple");
  const [previewTab, setPreviewTab] = useState<SectionId>("couple");
  const [draft, setDraft] = useState<EditorDraft>(() => makeDraft(template, initialData, initialTheme));
  const [saved, setSaved] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);
  const [savingCloud, setSavingCloud] = useState(false);
  const [publishNote, setPublishNote] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cloudSaveQueue = useRef<Promise<SaveState | null>>(Promise.resolve(null));

  const liveTemplate = useMemo<WeddingTemplate>(() => ({ ...template, theme: draft.theme }), [template, draft.theme]);
  const gallery = useMemo(() => [...draft.data.gallery, ...draft.uploadedGallery.map((i) => i.url)], [draft.data.gallery, draft.uploadedGallery]);

  // Build a URL-safe token so the /templates/[slug] "Static demo" page can
  // render the current draft — otherwise it would show the static example.
  const previewHref = useMemo(() => {
    // Only encode fields that differ from the demo baseline so the token stays
    // short even with uploaded Supabase Storage URLs — otherwise the link
    // would silently drop the preview (e.g. couple photos not updating).
    const patch = diffInvitation(DEMO_INVITATION, { ...draft.data, gallery });
    const themeChanged = JSON.stringify(draft.theme) !== JSON.stringify(template.theme);
    const token = encodePreview({ data: patch, theme: themeChanged ? draft.theme : undefined });
    return token ? `/templates/${template.slug}?preview=${token}` : `/templates/${template.slug}`;
  }, [draft.data, draft.theme, gallery, template.slug, template.theme]);

  const persistCloud = useCallback((next: EditorDraft, nextGallery: string[], showMessage: boolean): Promise<SaveState | null> => {
    if (!invitationId) return Promise.resolve(null);

    // Serialize cloud writes so a slower request can never overwrite a newer
    // edit. This matters when someone types quickly or changes several fields
    // before leaving the editor.
    cloudSaveQueue.current = cloudSaveQueue.current
      .catch(() => null)
      .then(async () => {
        setSavingCloud(true);
        if (showMessage) setCloudMessage(null);
        try {
          const result = await saveInvitationDraft({
            invitationId,
            title: invitationTitle ?? `${next.data.couple.groom} & ${next.data.couple.bride}`,
            templateSlug: template.slug,
            data: { ...next.data, gallery: nextGallery },
            theme: next.theme,
          });
          if (showMessage || !result.ok) setCloudMessage(result.message);
          if (!result.ok) window.setTimeout(() => setCloudMessage(null), 5000);
          return result;
        } catch {
          const result: SaveState = { ok: false, message: "Could not save to your account. Your local draft is safe." };
          setCloudMessage(result.message);
          window.setTimeout(() => setCloudMessage(null), 5000);
          return result;
        } finally {
          setSavingCloud(false);
          if (showMessage) window.setTimeout(() => setCloudMessage(null), 4000);
        }
      });

    return cloudSaveQueue.current;
  }, [invitationId, invitationTitle, template.slug]);

  useEffect(() => {
    // Defer browser storage hydration until after the first paint. Besides
    // avoiding an SSR mismatch, this keeps the editor responsive on phones
    // while the browser restores a larger draft.
    const timeout = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey(template.slug));
        if (stored) {
          const parsed = JSON.parse(stored) as EditorDraft;
          if (parsed.templateSlug === template.slug) {
            const fresh = makeDraft(template, initialData, initialTheme);
            setDraft({
              ...fresh,
              ...parsed,
              data: {
                ...fresh.data,
                ...parsed.data,
                sections: { ...ALL_SECTIONS_ON, ...(parsed.data?.sections ?? {}) },
                photos: { bride: parsed.data?.photos?.bride ?? "", groom: parsed.data?.photos?.groom ?? "" },
              },
            });
          }
        }
      } catch {
        // Ignore malformed local drafts.
      } finally {
        setLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [template, initialData, initialTheme]);

  useEffect(() => {
    if (!loaded) return;
    const timeout = setTimeout(() => {
      const next = { ...draft, lastSavedAt: new Date().toISOString() };
      localStorage.setItem(storageKey(template.slug), JSON.stringify(next));
    }, 450);
    return () => clearTimeout(timeout);
  }, [draft, loaded, template.slug]);

  // Keep account-backed invitations in sync while the owner edits. The old
  // flow only saved localStorage until the Save button was pressed, so a
  // publish action from the dashboard could expose stale demo content.
  useEffect(() => {
    if (!loaded || !invitationId) return;
    const timeout = window.setTimeout(() => {
      void persistCloud(draft, gallery, false);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [draft, gallery, loaded, invitationId, persistCloud]);

  function patchData(patch: Partial<DraftInvitation>) {
    setDraft((d) => ({ ...d, data: { ...d.data, ...patch } }));
  }

  async function saveDraft() {
    const next = { ...draft, lastSavedAt: new Date().toISOString() };
    localStorage.setItem(storageKey(template.slug), JSON.stringify(next));
    setDraft(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);

    // Save immediately as well as through the debounced autosave so the
    // owner can safely publish right after pressing Save.
    if (invitationId) await persistCloud(next, gallery, true);
  }

  async function publishDraft() {
    if (!invitationId) {
      setPublishNote(true);
      return;
    }

    const next = { ...draft, lastSavedAt: new Date().toISOString() };
    localStorage.setItem(storageKey(template.slug), JSON.stringify(next));
    setDraft(next);
    const savedResult = await persistCloud(next, gallery, true);
    if (savedResult && !savedResult.ok) return;

    try {
      const formData = new FormData();
      formData.set("id", invitationId);
      formData.set("published", "true");
      const result = await publishInvitationAction(formData);
      setPublishedSlug(result.publicSlug ?? null);
      setPublishNote(true);
    } catch (caught) {
      setCloudMessage(caught instanceof Error ? caught.message : "Could not publish this invitation.");
    }
  }

  function resetDraft() {
    const next = makeDraft(template);
    setDraft(next);
    localStorage.removeItem(storageKey(template.slug));
    setOpen("couple");
    setPreviewTab("couple");
  }

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      product: BRAND.name,
      template: { id: template.id, slug: template.slug, name: template.name },
      theme: draft.theme,
      invitation: { ...draft.data, gallery },
      uploadedGallery: draft.uploadedGallery,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.slug}-invitation-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-svh bg-cream/60">
      <header className="glass-warm sticky top-0 z-40 border-b border-gold/20">
        <div className="mx-auto flex min-h-16 max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href={previewHref} aria-label="Back to template preview" className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-charcoal transition-colors hover:bg-gold/10">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            </Link>
            <div className="leading-tight">
              <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">{BRAND.name} Complete Editor</p>
              <p className="font-display text-xl font-semibold text-charcoal">{template.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <AnimatePresence>
              {saved && (
                <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="hidden items-center gap-1.5 font-sans text-[11px] uppercase tracking-wide-2 text-sage sm:inline-flex">
                  <Check className="h-3.5 w-3.5" strokeWidth={2} /> Saved locally
                </motion.span>
              )}
            </AnimatePresence>
            <button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-burgundy/35 px-4 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-burgundy transition-colors hover:bg-burgundy/5" aria-label="Open live preview">
              <Eye className="h-3.5 w-3.5" strokeWidth={1.8} /> <span className="hidden sm:inline">Preview</span>
            </button>
            <button type="button" onClick={resetDraft} className="inline-flex items-center gap-2 rounded-full border border-gold/35 px-4 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-charcoal transition-colors hover:bg-gold/10">
              <Undo2 className="h-3.5 w-3.5" strokeWidth={1.8} /> <span className="hidden sm:inline">Reset</span>
            </button>
            <button type="button" onClick={saveDraft} className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-charcoal transition-colors hover:bg-gold/10">
              <Save className="h-3.5 w-3.5" strokeWidth={1.8} /> <span className="hidden sm:inline">Save</span>
            </button>
            <button type="button" onClick={exportJson} className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-charcoal transition-colors hover:bg-gold/10">
              <Download className="h-3.5 w-3.5" strokeWidth={1.8} /> <span className="hidden sm:inline">Export</span>
            </button>
            <button type="button" onClick={publishDraft} disabled={savingCloud} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] px-5 py-2.5 font-sans text-[11px] font-medium uppercase tracking-wide-2 text-burgundy-deep shadow-md transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
              <Rocket className="h-3.5 w-3.5" strokeWidth={1.8} /> Publish
            </button>
          </div>
        </div>
        <AnimatePresence>
          {(savingCloud || cloudMessage) && (
            <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gold/20 bg-sage/10 text-center font-sans text-[12px] text-charcoal">
              <span className="block px-4 py-2.5">{savingCloud ? "Saving to your account…" : cloudMessage}</span>
            </motion.p>
          )}
          {publishNote && (
            <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gold/20 bg-gold-pale/40 text-center font-sans text-[12px] text-ink-soft">
              <span className="block px-4 py-2.5">
                {publishedSlug ? (
                  <>Published successfully. <Link href={`/i/${publishedSlug}`} className="font-medium text-burgundy underline-offset-2 hover:underline">Open your live invitation</Link>.</>
                ) : invitationId ? (
                  "Changes save to your account before publishing. Publish here or from My Invitations when you are ready to share the guest link."
                ) : (
                  "Log in and start an invitation from your dashboard to save it to your account and publish a shareable link."
                )}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </header>

      <div className="mx-auto grid min-w-0 max-w-[1500px] gap-6 px-3 py-5 sm:gap-8 sm:px-6 sm:py-8 xl:grid-cols-[410px_minmax(0,1fr)]">
        <aside className="order-2 min-w-0 xl:order-1">
          <div className="mb-4 rounded-2xl border border-gold/20 bg-white/70 p-5">
            <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Draft status</p>
            <p className="mt-2 font-sans text-[13px] font-light leading-relaxed text-ink-soft/70">
              Every field below updates the invitation preview instantly. Drafts autosave in this browser.
            </p>
            <p className="mt-3 font-sans text-[11px] text-ink-soft/45">
              {draft.lastSavedAt ? `Last saved: ${new Date(draft.lastSavedAt).toLocaleString()}` : "Not saved yet"}
            </p>
          </div>

          <div className="space-y-2.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isOpen = open === s.id;
              return (
                <div key={s.id} className="overflow-hidden rounded-2xl border border-gold/20 bg-white/80">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(isOpen ? "couple" : s.id);
                      setPreviewTab(s.id);
                    }}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3.5 px-5 py-4 text-left"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold"><Icon className="h-4 w-4" strokeWidth={1.7} /></span>
                    <span className="flex-1 font-display text-lg font-semibold text-charcoal">{s.label}</span>
                    <span className={`text-gold transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="space-y-4 border-t border-gold/15 px-5 py-5">
                          {s.id === "couple" && <CouplePanel draft={draft} patchData={patchData} userId={user?.id} />}
                          {s.id === "sections" && <SectionsPanel draft={draft} patchData={patchData} />}
                          {s.id === "story" && <StoryPanel userId={user?.id} moments={draft.data.story} onChange={(story) => patchData({ story })} />}
                          {s.id === "events" && <EventsPanel events={draft.data.events} onChange={(events) => patchData({ events })} />}
                          {s.id === "gallery" && (
                            <GalleryPanel
                              userId={user?.id}
                              demoImages={draft.data.gallery}
                              uploadedImages={draft.uploadedGallery}
                              onDemoChange={(galleryImages) => patchData({ gallery: galleryImages })}
                              onUploadedChange={(uploadedGallery) => setDraft((d) => ({ ...d, uploadedGallery }))}
                            />
                          )}
                          {s.id === "venue" && <VenuePanel draft={draft} patchData={patchData} />}
                          {s.id === "rsvp" && <RsvpPanel draft={draft} patchData={patchData} />}
                          {s.id === "music" && <MusicPanel draft={draft} patchData={patchData} userId={user?.id} />}
                          {s.id === "family" && <FamilyPanel draft={draft} patchData={patchData} />}
                          {s.id === "travel" && <LongTextField label="Travel & stay" value={draft.data.travel} onChange={(travel) => patchData({ travel })} />}
                          {s.id === "gifts" && <LongTextField label="Gift information" value={draft.data.gifts} onChange={(gifts) => patchData({ gifts })} />}
                          {s.id === "theme" && <ThemePanel template={template} theme={draft.theme} onChange={(theme) => setDraft((d) => ({ ...d, theme }))} />}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="order-1 min-w-0 xl:order-2">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,390px)_minmax(0,1fr)] xl:sticky xl:top-24">
            <div className="flex flex-col items-center gap-5">
              <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Mobile invitation preview</p>
              <PhonePreview template={liveTemplate} draft={draft} gallery={gallery} />
              <div className="flex flex-wrap justify-center gap-2">
                {SECTIONS.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPreviewTab(s.id)}
                    className={`rounded-full border px-3 py-1.5 font-sans text-[10px] uppercase tracking-wide-2 transition-colors ${
                      previewTab === s.id ? "border-burgundy bg-burgundy text-ivory" : "border-gold/30 text-ink-soft hover:border-gold"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <ExpandedPreview template={liveTemplate} draft={draft} gallery={gallery} active={previewTab} previewHref={previewHref} />
          </div>
        </section>
      </div>

      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-charcoal/80 px-3 py-5 backdrop-blur-xl sm:px-4 sm:py-8"
            role="dialog"
            aria-modal="true"
            aria-label="Live invitation preview"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-5 flex items-center justify-between gap-4 text-ivory">
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft">Live preview</p>
                  <h2 className="mt-1 font-display text-3xl font-medium">Your edited invitation</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10"
                  aria-label="Close live preview"
                >
                  <X className="h-5 w-5" strokeWidth={1.7} />
                </button>
              </div>
              <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,390px)_minmax(0,1fr)]">
                <PhonePreview template={liveTemplate} draft={draft} gallery={gallery} />
                <ExpandedPreview template={liveTemplate} draft={draft} gallery={gallery} active={previewTab} previewHref={previewHref} />
              </div>
              <p className="mt-5 text-center font-sans text-[12px] font-light text-ivory/60">
                This preview is generated from your current editor draft — not the static template demo.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Editor panels                                                              */
/* -------------------------------------------------------------------------- */

function PhotoField({ label, value, onChange, userId, folder }: { label: string; value: string; onChange: (url: string) => void; userId?: string; folder: string }) {
  return (
    <div className="space-y-2">
      <p className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{label}</p>
      <div className="flex items-center gap-3">
        {value ? (
          <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-gold/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="h-full w-full object-cover" />
          </span>
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gold/40 font-display text-lg text-gold">+</span>
        )}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste photo URL" className="editor-input flex-1" />
        {value && <button type="button" onClick={() => onChange("")} className="rounded-lg border border-maroon/25 px-2 py-2 text-maroon" aria-label="Remove photo"><Trash2 className="h-3.5 w-3.5" /></button>}
      </div>
      {userId && (
        <ImageUploader
          userId={userId}
          folder={folder}
          kind="image"
          multiple={false}
          maxFiles={1}
          images={value ? [{ path: "", url: value }] : []}
          onChange={(imgs) => onChange(imgs[0]?.url ?? "")}
          label="Upload photo"
          hint="Uploaded to Supabase Storage."
        />
      )}
    </div>
  );
}

function CouplePanel({ draft, patchData, userId }: { draft: EditorDraft; patchData: (patch: Partial<DraftInvitation>) => void; userId?: string }) {
  return (
    <div className="space-y-4">
      <Field label="Partner one / groom" value={draft.data.couple.groom} onChange={(groom) => patchData({ couple: { ...draft.data.couple, groom, monogram: monogram(groom, draft.data.couple.bride) } })} />
      <Field label="Partner two / bride" value={draft.data.couple.bride} onChange={(bride) => patchData({ couple: { ...draft.data.couple, bride, monogram: monogram(draft.data.couple.groom, bride) } })} />
      <Field label="Monogram" value={draft.data.couple.monogram} onChange={(monogramValue) => patchData({ couple: { ...draft.data.couple, monogram: monogramValue } })} />
      <Field label="Family line" value={draft.data.couple.familiesLine} onChange={(familiesLine) => patchData({ couple: { ...draft.data.couple, familiesLine } })} />
      <LongTextField label="Invitation line" value={draft.data.couple.inviteLine} onChange={(inviteLine) => patchData({ couple: { ...draft.data.couple, inviteLine } })} rows={3} />
      <Field label="Display wedding date" value={draft.data.dateLabel} onChange={(dateLabel) => patchData({ dateLabel })} />
      <Field label="Countdown date/time (ISO)" value={draft.data.dateISO} onChange={(dateISO) => patchData({ dateISO })} />
      <LongTextField label="Final message" value={draft.data.finalMessage} onChange={(finalMessage) => patchData({ finalMessage })} rows={3} />
      <div className="border-t border-gold/15 pt-4">
        <PhotoField label="Partner one photo" userId={userId} folder="photos" value={draft.data.photos.groom} onChange={(groom) => patchData({ photos: { ...draft.data.photos, groom } })} />
      </div>
      <PhotoField label="Partner two photo" userId={userId} folder="photos" value={draft.data.photos.bride} onChange={(bride) => patchData({ photos: { ...draft.data.photos, bride } })} />
    </div>
  );
}

function SectionsPanel({ draft, patchData }: { draft: EditorDraft; patchData: (patch: Partial<DraftInvitation>) => void }) {
  const flags = draft.data.sections;
  const set = (k: SectionKey, v: boolean) => patchData({ sections: { ...flags, [k]: v } });
  const items: { key: SectionKey; label: string }[] = [
    { key: "story", label: "Our Story" },
    { key: "events", label: "Wedding Events" },
    { key: "gallery", label: "Photo Gallery" },
    { key: "venue", label: "Venue & Map" },
    { key: "countdown", label: "Countdown" },
    { key: "rsvp", label: "RSVP" },
    { key: "music", label: "Music" },
    { key: "family", label: "Family" },
    { key: "travel", label: "Travel & Stay" },
    { key: "gifts", label: "Gift Information" },
  ];
  return (
    <div className="space-y-2.5">
      <p className="font-sans text-[12px] font-light leading-relaxed text-ink-soft/65">
        Switch sections on or off. Disabled sections are hidden from the live preview and the published invitation.
      </p>
      {items.map((it) => <Toggle key={it.key} label={it.label} checked={flags[it.key] !== false} onChange={(v) => set(it.key, v)} />)}
    </div>
  );
}

function StoryPanel({ moments, onChange, userId }: { moments: StoryMoment[]; onChange: (moments: StoryMoment[]) => void; userId?: string }) {
  function patch(index: number, value: Partial<StoryMoment>) {
    onChange(moments.map((m, i) => (i === index ? { ...m, ...value } : m)));
  }
  return (
    <div className="space-y-4">
      {moments.map((m, i) => (
        <NestedCard key={`${m.year}-${i}`} title={`${i + 1}. ${m.title || "Story moment"}`} onRemove={moments.length > 1 ? () => onChange(moments.filter((_, idx) => idx !== i)) : undefined}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Year" value={m.year} onChange={(year) => patch(i, { year })} />
            <Field label="Title" value={m.title} onChange={(title) => patch(i, { title })} />
          </div>
          <LongTextField label="Story text" value={m.text} onChange={(text) => patch(i, { text })} rows={3} />
          {userId ? (
            <ImageUploader
              userId={userId}
              folder="story"
              kind="image"
              multiple={false}
              maxFiles={1}
              images={m.image ? [{ path: "", url: m.image }] : []}
              onChange={(imgs) => patch(i, { image: imgs[0]?.url ?? "" })}
              label="Upload story photo"
              hint="Upload one photo for this story moment."
            />
          ) : (
            <p className="rounded-xl bg-gold-pale/50 px-4 py-3 font-sans text-[12px] leading-relaxed font-light text-ink-soft/75">
              <Link href="/login" className="font-medium text-burgundy underline-offset-2 hover:underline">Log in</Link>{" "}
              to upload a story photo from your device.
            </p>
          )}
        </NestedCard>
      ))}
      <AddButton onClick={() => onChange([...moments, { year: "2026", title: "A New Chapter", text: "Write a beautiful memory from your journey.", image: "" }])}>Add story moment</AddButton>
    </div>
  );
}

function EventsPanel({ events, onChange }: { events: WeddingEvent[]; onChange: (events: WeddingEvent[]) => void }) {
  function patch(index: number, value: Partial<WeddingEvent>) {
    onChange(events.map((e, i) => (i === index ? { ...e, ...value } : e)));
  }
  return (
    <div className="space-y-4">
      {events.map((e, i) => (
        <NestedCard key={`${e.name}-${i}`} title={`${i + 1}. ${e.name || "Event"}`} onRemove={events.length > 1 ? () => onChange(events.filter((_, idx) => idx !== i)) : undefined}>
          <Field label="Event name" value={e.name} onChange={(name) => patch(i, { name })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date" value={e.date} onChange={(date) => patch(i, { date })} />
            <Field label="Time" value={e.time} onChange={(time) => patch(i, { time })} />
          </div>
          <Field label="Venue" value={e.venue} onChange={(venue) => patch(i, { venue })} />
          <LongTextField label="Address" value={e.address} onChange={(address) => patch(i, { address })} rows={2} />
          <Field label="Google Maps URL" value={e.mapUrl} onChange={(mapUrl) => patch(i, { mapUrl })} />
          <Field label="Dress code" value={e.dressCode ?? ""} onChange={(dressCode) => patch(i, { dressCode })} />
          <LongTextField label="Description" value={e.description ?? ""} onChange={(description) => patch(i, { description })} rows={3} />
        </NestedCard>
      ))}
      <AddButton onClick={() => onChange([...events, { name: "New Celebration", date: "15 December 2026", time: "6:00 PM", venue: "Venue Name", address: "Venue address", mapUrl: "https://maps.google.com", dressCode: "Festive", description: "Describe this celebration." }])}>Add event</AddButton>
    </div>
  );
}

function GalleryPanel({
  userId,
  demoImages,
  uploadedImages,
  onDemoChange,
  onUploadedChange,
}: {
  userId: string | undefined;
  demoImages: string[];
  uploadedImages: UploadedImage[];
  onDemoChange: (images: string[]) => void;
  onUploadedChange: (images: UploadedImage[]) => void;
}) {
  const [newUrl, setNewUrl] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Gallery image URLs</p>
        <div className="space-y-2">
          {demoImages.map((src, i) => (
            <div key={`${src}-${i}`} className="flex gap-2">
              <input value={src} onChange={(e) => onDemoChange(demoImages.map((img, idx) => (idx === i ? e.target.value : img)))} className="editor-input flex-1" aria-label={`Gallery image ${i + 1}`} />
              <button type="button" onClick={() => onDemoChange(demoImages.filter((_, idx) => idx !== i))} className="rounded-xl border border-maroon/25 px-3 text-maroon" aria-label="Remove image URL"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="editor-input flex-1" placeholder="Paste image URL" />
          <button type="button" onClick={() => { if (newUrl.trim()) onDemoChange([...demoImages, newUrl.trim()]); setNewUrl(""); }} className="rounded-xl border border-gold/40 px-3 text-burgundy" aria-label="Add image URL"><Plus className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="border-t border-gold/15 pt-4">
        <p className="mb-2 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Supabase Storage uploads</p>
        {userId ? (
          <ImageUploader userId={userId} folder="gallery" images={uploadedImages} onChange={onUploadedChange} label="Upload your photos" maxFiles={10} />
        ) : (
          <p className="rounded-xl bg-gold-pale/50 px-4 py-3 font-sans text-[12px] leading-relaxed font-light text-ink-soft/75">
            <Link href="/login" className="font-medium text-burgundy underline-offset-2 hover:underline">Log in</Link>{" "}
            to upload photos to Supabase Storage. URL-based gallery editing works without login.
          </p>
        )}
      </div>
    </div>
  );
}

function VenuePanel({ draft, patchData }: { draft: EditorDraft; patchData: (patch: Partial<DraftInvitation>) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Venue name" value={draft.data.venue.name} onChange={(name) => patchData({ venue: { ...draft.data.venue, name } })} />
      <Field label="City / region" value={draft.data.venue.city} onChange={(city) => patchData({ venue: { ...draft.data.venue, city } })} />
      <LongTextField label="Full address" value={draft.data.venue.address} onChange={(address) => patchData({ venue: { ...draft.data.venue, address } })} rows={3} />
      <Field label="Google Maps URL" value={draft.data.venue.mapUrl} onChange={(mapUrl) => patchData({ venue: { ...draft.data.venue, mapUrl } })} />
    </div>
  );
}

function RsvpPanel({ draft, patchData }: { draft: EditorDraft; patchData: (patch: Partial<DraftInvitation>) => void }) {
  const rsvp = draft.data.rsvp;
  return (
    <div className="space-y-4">
      <Toggle label="Enable RSVP section" checked={draft.data.sections.rsvp !== false} onChange={(v) => patchData({ sections: { ...draft.data.sections, rsvp: v } })} />
      <Field label="RSVP headline" value={rsvp.prompt} onChange={(prompt) => patchData({ rsvp: { ...rsvp, prompt } })} />
      <Field label="Accept label" value={rsvp.acceptLabel} onChange={(acceptLabel) => patchData({ rsvp: { ...rsvp, acceptLabel } })} />
      <Field label="Decline label" value={rsvp.declineLabel} onChange={(declineLabel) => patchData({ rsvp: { ...rsvp, declineLabel } })} />
      <LongTextField label="RSVP note" value={rsvp.note} onChange={(note) => patchData({ rsvp: { ...rsvp, note } })} rows={3} />
    </div>
  );
}

function MusicPanel({ draft, patchData, userId }: { draft: EditorDraft; patchData: (patch: Partial<DraftInvitation>) => void; userId?: string }) {
  const music = draft.data.music;
  const setMusic = (patch: Partial<DraftInvitation["music"]>) => patchData({ music: { ...music, ...patch } });
  const setEnabled = (v: boolean) => patchData({ sections: { ...draft.data.sections, music: v } });
  return (
    <div className="space-y-4">
      <Toggle label="Enable music" checked={draft.data.sections.music !== false} onChange={setEnabled} />
      <Field label="Song title" value={music.title} onChange={(title) => setMusic({ title })} />
      <Field label="Artist / version" value={music.artist} onChange={(artist) => setMusic({ artist })} />
      <Field label="Audio URL" value={music.url} onChange={(url) => setMusic({ url })} />
      {userId ? (
        <div className="border-t border-gold/15 pt-4">
          <p className="mb-2 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Upload custom music</p>
          <ImageUploader
            userId={userId}
            folder="music"
            kind="audio"
            multiple={false}
            maxFiles={1}
            images={music.url ? [{ path: "", url: music.url }] : []}
            onChange={(imgs) => setMusic({ url: imgs[0]?.url ?? "" })}
            label="Upload music file"
            hint="mp3 / m4a / wav / ogg · stored in Supabase Storage."
          />
        </div>
      ) : (
        <p className="rounded-xl bg-gold-pale/50 px-4 py-3 font-sans text-[12px] leading-relaxed font-light text-ink-soft/75">
          <Link href="/login" className="font-medium text-burgundy underline-offset-2 hover:underline">Log in</Link>{" "}
          to upload your own song to Supabase Storage.
        </p>
      )}
    </div>
  );
}

function FamilyPanel({ draft, patchData }: { draft: EditorDraft; patchData: (patch: Partial<DraftInvitation>) => void }) {
  return (
    <div className="space-y-5">
      <StringList title="Partner one family" values={draft.data.family.him} onChange={(him) => patchData({ family: { ...draft.data.family, him } })} />
      <StringList title="Partner two family" values={draft.data.family.her} onChange={(her) => patchData({ family: { ...draft.data.family, her } })} />
    </div>
  );
}

function ThemePanel({ template, theme, onChange }: { template: WeddingTemplate; theme: TemplateTheme; onChange: (theme: TemplateTheme) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Palette presets</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {palettePresets(template.theme).map((p) => (
            <button key={p.name} type="button" onClick={() => onChange(p.theme)} className="flex items-center gap-3 rounded-xl border border-gold/20 p-3 text-left transition-colors hover:border-gold/60 hover:bg-gold/5">
              <span className="flex overflow-hidden rounded-full border border-charcoal/10">
                {[p.theme.bg, p.theme.gold, p.theme.accent, p.theme.script].map((c, j) => <span key={j} className="h-6 w-6" style={{ background: c }} />)}
              </span>
              <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["bg", "panel", "ink", "accent", "gold", "script"] as const).map((key) => (
          <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-white/70 px-3 py-2">
            <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{key}</span>
            <input type="color" value={theme[key]} onChange={(e) => onChange({ ...theme, [key]: e.target.value })} className="h-8 w-11 rounded border border-gold/20 bg-transparent" />
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Ornament style</span>
        <select value={theme.ornament} onChange={(e) => onChange({ ...theme, ornament: e.target.value as TemplateTheme["ornament"] })} className="editor-input">
          {(["royal", "line", "floral", "geo", "modern", "coastal"] as const).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <Toggle label="Dark theme surfaces" checked={Boolean(theme.dark)} onChange={(dark) => onChange({ ...theme, dark })} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Preview components                                                         */
/* -------------------------------------------------------------------------- */

function PhonePreview({ template, draft, gallery }: { template: WeddingTemplate; draft: EditorDraft; gallery: string[] }) {
  const theme = template.theme;
  return (
    <div className="relative mx-auto w-full max-w-[390px] overflow-hidden rounded-[30px] border-[8px] border-charcoal bg-charcoal shadow-lux sm:rounded-[42px] sm:border-[10px]">
      <div className="absolute top-0 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-charcoal sm:h-6 sm:w-32" aria-hidden="true" />
      <div className="relative h-[min(720px,calc(100svh-10rem))] min-h-[540px] overflow-y-auto rounded-[22px] overscroll-contain sm:h-[720px] sm:min-h-0 sm:rounded-[32px]" style={{ background: theme.bg, color: theme.ink }}>
        <div className="h-[590px]">
          <MiniPreview
            template={template}
            bride={draft.data.couple.bride}
            groom={draft.data.couple.groom}
            dateLabel={draft.data.dateLabel}
            familiesLine={draft.data.couple.familiesLine}
          />
        </div>
        {(draft.data.photos.groom || draft.data.photos.bride) && (
          <div className="flex items-center justify-center gap-4 px-6 pt-5">
            {draft.data.photos.groom && (
              <figure className="flex flex-col items-center gap-1.5">
                <span className="block h-16 w-16 overflow-hidden rounded-full border-2" style={{ borderColor: theme.gold }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.data.photos.groom} alt={draft.data.couple.groom} className="h-full w-full object-cover" />
                </span>
                <figcaption className="font-sans text-[9px] uppercase tracking-wide-2" style={{ color: theme.accent }}>{draft.data.couple.groom}</figcaption>
              </figure>
            )}
            {draft.data.photos.groom && draft.data.photos.bride && (
              <span className="font-display text-lg italic" style={{ color: theme.gold }}>&</span>
            )}
            {draft.data.photos.bride && (
              <figure className="flex flex-col items-center gap-1.5">
                <span className="block h-16 w-16 overflow-hidden rounded-full border-2" style={{ borderColor: theme.gold }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.data.photos.bride} alt={draft.data.couple.bride} className="h-full w-full object-cover" />
                </span>
                <figcaption className="font-sans text-[9px] uppercase tracking-wide-2" style={{ color: theme.accent }}>{draft.data.couple.bride}</figcaption>
              </figure>
            )}
          </div>
        )}
        <div className="space-y-9 px-5 py-8">
          {draft.data.sections.story && <PreviewBlock title="Story" theme={theme}>
            <p className="font-display text-xl" style={{ color: theme.script }}>{draft.data.story[0]?.title}</p>
            <p className="mt-2 font-sans text-[12px] font-light leading-relaxed opacity-75">{draft.data.story[0]?.text}</p>
          </PreviewBlock>}
          {draft.data.sections.events && <PreviewBlock title="Events" theme={theme}>
            {draft.data.events.slice(0, 2).map((e) => <MiniEvent key={e.name} event={e} theme={theme} />)}
          </PreviewBlock>}
          {draft.data.sections.gallery && gallery.length > 0 && (
            <PreviewBlock title="Gallery" theme={theme}>
              <div className="grid grid-cols-3 gap-2">
                {gallery.slice(0, 6).map((src, i) => <PreviewImage key={`${src}-${i}`} src={src} alt="Gallery preview" />)}
              </div>
            </PreviewBlock>
          )}
          {draft.data.sections.venue && <PreviewBlock title="Venue" theme={theme}>
            <p className="font-display text-xl" style={{ color: theme.script }}>{draft.data.venue.name}</p>
            <p className="mt-1 font-sans text-[12px] font-light opacity-75">{draft.data.venue.address}</p>
          </PreviewBlock>}
          <PreviewBlock title="Final" theme={theme}>
            <p className="font-script text-4xl" style={{ color: theme.script }}>{draft.data.finalMessage}</p>
          </PreviewBlock>
        </div>
      </div>
    </div>
  );
}

function ExpandedPreview({ template, draft, gallery, active, previewHref }: { template: WeddingTemplate; draft: EditorDraft; gallery: string[]; active: SectionId; previewHref: string }) {
  const t = template.theme;
  return (
    <div className="min-w-0 rounded-[28px] border border-gold/20 bg-white/70 p-4 shadow-card sm:p-6 lg:min-h-[720px] lg:p-8">
      <div className="mb-6 flex flex-col items-start gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Expanded preview</p>
          <h2 className="mt-2 font-display text-3xl font-medium text-charcoal">{SECTIONS.find((s) => s.id === active)?.label ?? "Preview"}</h2>
        </div>
        <Link href={previewHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-gold/40 px-4 py-2.5 font-sans text-[10px] uppercase tracking-wide-2 text-burgundy transition-colors hover:bg-gold/10 sm:w-auto sm:text-[11px]">
          <Eye className="h-3.5 w-3.5" /> Full-page preview
        </Link>
      </div>

      <div className="min-w-0 overflow-hidden rounded-[24px] border p-4 sm:p-7" style={{ background: t.panel, borderColor: `${t.gold}55`, color: t.ink }}>
        {active === "sections" && <SectionsSummary draft={draft} />}
        {active !== "couple" && active !== "theme" && active !== "sections" && draft.data.sections[active as SectionKey] === false && (
          <p className="mb-5 rounded-xl border border-maroon/25 bg-maroon/5 px-4 py-3 font-sans text-[12px] font-light text-maroon">
            This section is disabled. Turn it on in the Sections panel to include it on the invitation.
          </p>
        )}
        {active === "couple" && <HeroPreview draft={draft} template={template} />}
        {active === "story" && <StoryPreview moments={draft.data.story} theme={t} />}
        {active === "events" && <EventsPreview events={draft.data.events} theme={t} />}
        {active === "gallery" && <GalleryPreview images={gallery} />}
        {active === "venue" && <VenuePreview draft={draft} theme={t} />}
        {active === "rsvp" && <RsvpPreview draft={draft} theme={t} />}
        {active === "music" && <MusicPreview draft={draft} theme={t} />}
        {active === "family" && <FamilyPreview draft={draft} theme={t} />}
        {active === "travel" && <TextPreview title="Travel & Stay" text={draft.data.travel} theme={t} />}
        {active === "gifts" && <TextPreview title="Gift Information" text={draft.data.gifts} theme={t} />}
        {active === "theme" && <ThemePreview template={template} />}
      </div>
    </div>
  );
}

function HeroPreview({ draft, template }: { draft: EditorDraft; template: WeddingTemplate }) {
  const t = template.theme;
  return (
    <div className="min-w-0 text-center">
      <p className="max-w-full break-words font-sans text-[10px] uppercase tracking-[0.24em] sm:text-[11px] sm:tracking-luxe" style={{ color: t.accent }}>{draft.data.couple.familiesLine}</p>
      {(draft.data.photos.groom || draft.data.photos.bride) && (
        <div className="mt-5 flex items-center justify-center gap-4">
          {draft.data.photos.groom && <span className="block h-20 w-20 overflow-hidden rounded-full border-2" style={{ borderColor: t.gold }}><img src={draft.data.photos.groom} alt={draft.data.couple.groom} className="h-full w-full object-cover" /></span>}
          {draft.data.photos.groom && draft.data.photos.bride && <span className="font-display text-xl italic" style={{ color: t.gold }}>&</span>}
          {draft.data.photos.bride && <span className="block h-20 w-20 overflow-hidden rounded-full border-2" style={{ borderColor: t.gold }}><img src={draft.data.photos.bride} alt={draft.data.couple.bride} className="h-full w-full object-cover" /></span>}
        </div>
      )}
      <Monogram text={draft.data.couple.monogram} className="mx-auto mt-5 h-14 w-14 text-[15px]" style={{ color: t.gold, borderColor: `${t.gold}90` }} />
      <h3 className="mt-6 max-w-full break-words leading-[0.95]">
        <span className="block break-words font-script text-[clamp(2.75rem,14vw,3.75rem)] sm:text-6xl" style={{ color: t.script }}>{draft.data.couple.groom}</span>
        <span className="my-1 block font-display text-xl italic" style={{ color: t.gold }}>&</span>
        <span className="block break-words font-script text-[clamp(2.75rem,14vw,3.75rem)] sm:text-6xl" style={{ color: t.script }}>{draft.data.couple.bride}</span>
      </h3>
      <Ornament style={t.ornament} className="mx-auto mt-6 h-5 w-44" />
      <p className="mx-auto mt-5 max-w-md font-display text-lg italic opacity-85">{draft.data.couple.inviteLine}</p>
      <p className="mt-4 font-sans text-[12px] uppercase tracking-wide-2">{draft.data.dateLabel}</p>
      <p className="mt-7 font-script text-4xl" style={{ color: t.script }}>{draft.data.finalMessage}</p>
    </div>
  );
}

function StoryPreview({ moments, theme }: { moments: StoryMoment[]; theme: TemplateTheme }) {
  return <div className="grid gap-4 sm:grid-cols-2">{moments.map((m, i) => <div key={`${m.year}-${i}`} className="rounded-2xl border p-5" style={{ borderColor: `${theme.gold}40` }}><p className="font-display text-3xl font-semibold" style={{ color: theme.gold }}>{m.year}</p><h3 className="mt-2 font-script text-3xl" style={{ color: theme.script }}>{m.title}</h3><p className="mt-2 font-sans text-[13px] font-light leading-relaxed opacity-75">{m.text}</p>{m.image && <PreviewImage src={m.image} alt={m.title} className="mt-4 aspect-[4/3]" />}</div>)}</div>;
}

function EventsPreview({ events, theme }: { events: WeddingEvent[]; theme: TemplateTheme }) {
  return <div className="grid gap-4 md:grid-cols-2">{events.map((e) => <MiniEvent key={`${e.name}-${e.date}`} event={e} theme={theme} large />)}</div>;
}

function GalleryPreview({ images }: { images: string[] }) {
  if (images.length === 0) return <p className="font-sans text-[13px] font-light opacity-70">No gallery images yet.</p>;
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{images.map((src, i) => <PreviewImage key={`${src}-${i}`} src={src} alt="Wedding gallery" className={i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"} />)}</div>;
}

function VenuePreview({ draft, theme }: { draft: EditorDraft; theme: TemplateTheme }) {
  return <div><p className="font-script text-4xl" style={{ color: theme.script }}>{draft.data.venue.name}</p><p className="mt-2 font-sans text-[13px] uppercase tracking-wide-2 opacity-70">{draft.data.venue.city}</p><p className="mt-4 max-w-xl font-sans text-[14px] font-light leading-relaxed opacity-80">{draft.data.venue.address}</p><a href={draft.data.venue.mapUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full px-5 py-3 font-sans text-[11px] uppercase tracking-wide-2" style={{ background: theme.gold, color: theme.dark ? theme.bg : "#fff" }}>Open map</a></div>;
}

function RsvpPreview({ draft, theme }: { draft: EditorDraft; theme: TemplateTheme }) {
  if (draft.data.sections.rsvp === false) return <p className="font-sans text-[13px] font-light opacity-70">RSVP is switched off for this invitation.</p>;
  return <div className="mx-auto max-w-lg text-center"><p className="font-script text-4xl" style={{ color: theme.script }}>{draft.data.rsvp.prompt}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><button className="rounded-full border px-5 py-3 font-sans text-[11px] uppercase tracking-wide-2" style={{ borderColor: `${theme.gold}66` }}>{draft.data.rsvp.acceptLabel}</button><button className="rounded-full border px-5 py-3 font-sans text-[11px] uppercase tracking-wide-2" style={{ borderColor: `${theme.gold}66` }}>{draft.data.rsvp.declineLabel}</button></div><p className="mt-4 font-sans text-[13px] font-light opacity-70">{draft.data.rsvp.note}</p></div>;
}

function MusicPreview({ draft, theme }: { draft: EditorDraft; theme: TemplateTheme }) {
  if (draft.data.sections.music === false) return <p className="font-sans text-[13px] font-light opacity-70">Music is switched off for this invitation.</p>;
  return <div className="text-center"><Music2 className="mx-auto h-8 w-8" style={{ color: theme.gold }} /><p className="mt-4 font-display text-3xl" style={{ color: theme.script }}>{draft.data.music.title}</p><p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 opacity-70">{draft.data.music.artist}</p>{draft.data.music.url && <audio className="mx-auto mt-5 w-full max-w-md" controls src={draft.data.music.url} />}</div>;
}

function FamilyPreview({ draft, theme }: { draft: EditorDraft; theme: TemplateTheme }) {
  return <div className="grid gap-4 sm:grid-cols-2">{[{ title: `${draft.data.couple.groom}'s Family`, list: draft.data.family.him }, { title: `${draft.data.couple.bride}'s Family`, list: draft.data.family.her }].map((f) => <div key={f.title} className="rounded-2xl border p-5 text-center" style={{ borderColor: `${theme.gold}40` }}><p className="font-display text-2xl" style={{ color: theme.script }}>{f.title}</p><Ornament style={theme.ornament} className="mx-auto my-4 h-3.5 w-28" />{f.list.map((m) => <p key={m} className="font-sans text-[13px] font-light leading-relaxed opacity-80">{m}</p>)}</div>)}</div>;
}

function TextPreview({ title, text, theme }: { title: string; text: string; theme: TemplateTheme }) {
  return <div><p className="font-script text-4xl" style={{ color: theme.script }}>{title}</p><p className="mt-4 max-w-2xl font-sans text-[14px] font-light leading-relaxed opacity-80">{text}</p></div>;
}

function ThemePreview({ template }: { template: WeddingTemplate }) {
  return <div className="h-[420px] overflow-hidden rounded-2xl"><MiniPreview template={template} /></div>;
}

function PreviewBlock({ title, theme, children }: { title: string; theme: TemplateTheme; children: ReactNode }) {
  return <section><p className="mb-3 font-sans text-[10px] uppercase tracking-luxe" style={{ color: theme.gold }}>{title}</p>{children}</section>;
}

function MiniEvent({ event, theme, large = false }: { event: WeddingEvent; theme: TemplateTheme; large?: boolean }) {
  return <article className={`rounded-2xl border ${large ? "p-5" : "p-4"}`} style={{ borderColor: `${theme.gold}40` }}><p className="font-display text-2xl" style={{ color: theme.script }}>{event.name}</p><p className="mt-2 font-sans text-[11px] uppercase tracking-wide-2 opacity-70">{event.date} · {event.time}</p><p className="mt-2 font-sans text-[13px] font-medium">{event.venue}</p><p className="mt-1 font-sans text-[12px] font-light opacity-70">{event.address}</p>{large && event.description && <p className="mt-3 font-sans text-[13px] font-light leading-relaxed opacity-75">{event.description}</p>}</article>;
}

function PreviewImage({ src, alt, className = "aspect-square" }: { src: string; alt: string; className?: string }) {
  return <div className={`overflow-hidden rounded-xl border border-gold/20 ${className}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={alt} className="h-full w-full object-cover" /></div>;
}

/* -------------------------------------------------------------------------- */
/* Form primitives                                                            */
/* -------------------------------------------------------------------------- */

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="flex flex-col gap-1.5"><span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="editor-input" /></label>;
}

function LongTextField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return <label className="flex flex-col gap-1.5"><span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="editor-input resize-none" /></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 rounded-xl border border-gold/20 bg-white/60 px-4 py-3"><span className="font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/70">{label}</span><button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-burgundy" : "bg-ink-soft/20"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} /></button></label>;
}

function NestedCard({ title, children, onRemove }: { title: string; children: ReactNode; onRemove?: () => void }) {
  return <div className="rounded-2xl border border-gold/20 bg-white/60 p-4"><div className="mb-4 flex items-center justify-between gap-3"><p className="font-display text-lg font-semibold text-charcoal">{title}</p>{onRemove && <button type="button" onClick={onRemove} className="rounded-full border border-maroon/25 p-2 text-maroon" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>}</div><div className="space-y-3">{children}</div></div>;
}

function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gold/50 px-4 py-3.5 font-sans text-[11px] uppercase tracking-wide-2 text-burgundy transition-colors hover:bg-gold/10"><Plus className="h-4 w-4" />{children}</button>;
}

function StringList({ title, values, onChange }: { title: string; values: string[]; onChange: (values: string[]) => void }) {
  return <div className="space-y-2"><p className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{title}</p>{values.map((v, i) => <div key={`${v}-${i}`} className="flex gap-2"><input value={v} onChange={(e) => onChange(values.map((item, idx) => (idx === i ? e.target.value : item)))} className="editor-input flex-1" /><button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="rounded-xl border border-maroon/25 px-3 text-maroon" aria-label="Remove family member"><Trash2 className="h-4 w-4" /></button></div>)}<AddButton onClick={() => onChange([...values, "Family member"])}>Add family member</AddButton></div>;
}

function SectionsSummary({ draft }: { draft: EditorDraft }) {
  const flags = draft.data.sections;
  const items: [string, boolean][] = [
    ["Story", flags.story], ["Events", flags.events], ["Gallery", flags.gallery],
    ["Venue", flags.venue], ["Countdown", flags.countdown], ["RSVP", flags.rsvp],
    ["Music", flags.music], ["Family", flags.family], ["Travel", flags.travel], ["Gifts", flags.gifts],
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map(([label, on]) => (
        <div key={label} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${on !== false ? "border-sage/40 bg-sage/8" : "border-ink-soft/20 bg-ink-soft/5 opacity-60"}`}>
          <span className="font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/80">{label}</span>
          <span className={`font-sans text-[10px] uppercase tracking-wide-2 ${on !== false ? "text-sage" : "text-ink-soft/50"}`}>{on !== false ? "Visible" : "Hidden"}</span>
        </div>
      ))}
    </div>
  );
}

function monogram(groom: string, bride: string) {
  return `${(groom.trim()[0] ?? "A").toUpperCase()} & ${(bride.trim()[0] ?? "M").toUpperCase()}`;
}
