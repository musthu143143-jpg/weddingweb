import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedInvitation } from "@/lib/invitations";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getTemplate, TEMPLATES } from "@/data/templates";
import { DEMO_INVITATION } from "@/data/content";
import type { InvitationData, TemplateTheme } from "@/lib/types";
import InvitationDemo from "@/components/invitation/InvitationDemo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  if (!getSupabaseConfig()) return { title: "Invitation" };
  const { slug } = await params;
  const invitation = await getPublishedInvitation(slug);
  if (!invitation) return { title: "Invitation" };
  return {
    title: invitation.title,
    description: `You are invited — ${invitation.title}`,
    robots: { index: false, follow: false },
  };
}

/** Merges a saved editor draft over the demo content so partial drafts still render. */
function mergeData(saved: unknown): InvitationData {
  if (!saved || typeof saved !== "object") return DEMO_INVITATION;
  const draft = saved as Partial<InvitationData>;
  return {
    ...DEMO_INVITATION,
    ...draft,
    couple: { ...DEMO_INVITATION.couple, ...(draft.couple ?? {}) },
    venue: { ...DEMO_INVITATION.venue, ...(draft.venue ?? {}) },
    music: { ...DEMO_INVITATION.music, ...(draft.music ?? {}) },
    family: { ...DEMO_INVITATION.family, ...(draft.family ?? {}) },
    events: "events" in draft ? draft.events ?? [] : DEMO_INVITATION.events,
    story: "story" in draft ? draft.story ?? [] : DEMO_INVITATION.story,
    gallery: "gallery" in draft ? draft.gallery ?? [] : DEMO_INVITATION.gallery,
  };
}

export default async function PublicInvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!getSupabaseConfig()) notFound();

  const { slug } = await params;
  const invitation = await getPublishedInvitation(slug);
  if (!invitation) notFound();

  const base = getTemplate(invitation.templateSlug) ?? TEMPLATES[0];
  const template = invitation.theme
    ? { ...base, theme: { ...base.theme, ...(invitation.theme as Partial<TemplateTheme>) } }
    : base;

  return <InvitationDemo template={template} data={mergeData(invitation.data)} />;
}
