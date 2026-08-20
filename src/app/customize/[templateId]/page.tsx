import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplate, TEMPLATES } from "@/data/templates";
import { getAuthedContext } from "@/lib/authGuard";
import { getUserInvitation } from "@/lib/invitations";
import { getSupabaseConfig } from "@/lib/supabase/config";
import Editor from "@/components/customize/Editor";

export async function generateMetadata({ params }: { params: Promise<{ templateId: string }> }): Promise<Metadata> {
  const { templateId } = await params;
  const t = getTemplate(templateId);
  return { title: t ? `Customize ${t.name}` : "Customize Invitation" };
}

export default async function CustomizePage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ invitation?: string }>;
}) {
  const { templateId } = await params;
  const { invitation: invitationId } = await searchParams;

  const template = getTemplate(templateId) ?? TEMPLATES.find((t) => t.id === templateId);
  if (!template) notFound();

  // If opened from the dashboard, confirm the caller actually owns this invitation.
  let ownedId: string | undefined;
  let ownedTitle: string | undefined;
  if (invitationId && getSupabaseConfig()) {
    const ctx = await getAuthedContext();
    if (ctx) {
      const record = await getUserInvitation(ctx.userId, invitationId);
      if (record) {
        ownedId = record.id;
        ownedTitle = record.title;
      }
    }
  }

  return <Editor template={template} invitationId={ownedId} invitationTitle={ownedTitle} />;
}
