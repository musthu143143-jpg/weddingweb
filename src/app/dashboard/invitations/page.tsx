import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye, Globe, Palette } from "lucide-react";
import { getAuthedContext, homeForRole } from "@/lib/authGuard";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { listUserInvitations } from "@/lib/invitations";
import { TEMPLATES } from "@/data/templates";
import DashboardShell, { Card, DashboardHero, EmptyState } from "@/components/dashboard/DashboardShell";
import { deleteInvitationAction, renameInvitationAction, togglePublishAction } from "@/app/dashboard/actions";
import CopyLinkButton from "@/components/dashboard/CopyLinkButton";
import UnlockButton from "@/components/dashboard/UnlockButton";

export const metadata: Metadata = { title: "My Invitations" };
export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  if (!getSupabaseConfig()) redirect("/login?setup=1");
  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login");
  if (ctx.profile.role !== "user") redirect(homeForRole(ctx.profile.role));

  const rows = await listUserInvitations(ctx.userId);

  return (
    <DashboardShell active="/dashboard/invitations" email={ctx.email}>
      <DashboardHero eyebrow="Your collection" title="My Invitations" sub="Edit, publish and share every invitation you have created." />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {rows.length === 0 ? (
          <EmptyState
            title="You have not created an invitation yet"
            text="Head back to your studio to start one — it only takes a name and a design."
            cta={<Link href="/dashboard" className="rounded-full bg-burgundy px-6 py-3 font-sans text-[11px] uppercase tracking-wide-2 text-ivory">Go to studio</Link>}
          />
        ) : (
          <div className="space-y-5">
            {rows.map((inv) => {
              const template = TEMPLATES.find((t) => t.slug === inv.templateSlug);
              return (
                <Card key={inv.id}>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full border px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 ${inv.published ? "border-sage/50 bg-sage/10 text-sage" : "border-gold/40 bg-gold/10 text-gold"}`}>
                          {inv.published ? "Published" : "Draft"}
                        </span>
                        <span className="font-sans text-[11px] text-ink-soft/50">Updated {inv.updatedAt.toLocaleString()}</span>
                      </div>

                      <form action={renameInvitationAction} className="mt-4 flex flex-wrap gap-2">
                        <input type="hidden" name="id" value={inv.id} />
                        <input name="title" defaultValue={inv.title} className="admin-input max-w-xs flex-1" aria-label="Invitation name" />
                        <button className="rounded-full border border-gold/45 px-5 py-2 font-sans text-[11px] uppercase tracking-wide-2 text-burgundy hover:bg-gold/10">Rename</button>
                      </form>

                      <p className="mt-3 font-sans text-[12px] font-light text-ink-soft/60">Design: {template?.name ?? inv.templateSlug}</p>
                      {inv.unlockedPlan ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-sage/50 bg-sage/10 px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 text-sage">
                          Unlocked · paid ₹{Number(inv.unlockedPlan).toLocaleString("en-IN")}
                        </p>
                      ) : (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 text-gold">
                          Publishing locked · order to unlock
                        </p>
                      )}

                      {inv.published && inv.publicSlug && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold/20 bg-gold-pale/30 px-4 py-3">
                          <Globe className="h-3.5 w-3.5 shrink-0 text-gold" />
                          <code className="min-w-0 truncate font-mono text-[12px] text-charcoal">/i/{inv.publicSlug}</code>
                          <CopyLinkButton path={`/i/${inv.publicSlug}`} />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/customize/${inv.templateSlug}?invitation=${inv.id}`} className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-ivory">
                        <Palette className="h-3.5 w-3.5" /> Edit
                      </Link>
                      {inv.published && inv.publicSlug && (
                        <Link href={`/i/${inv.publicSlug}`} className="inline-flex items-center gap-2 rounded-full border border-gold/45 px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-burgundy hover:bg-gold/10">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                      )}
                      {inv.unlockedPlan ? (
                        <form action={togglePublishAction}>
                          <input type="hidden" name="id" value={inv.id} />
                          <input type="hidden" name="published" value={(!inv.published).toString()} />
                          <button className="rounded-full border border-gold/45 px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-burgundy hover:bg-gold/10">
                            {inv.published ? "Unpublish" : "Publish"}
                          </button>
                        </form>
                      ) : (
                        <UnlockButton invitationId={inv.id} templateName={template?.name ?? inv.templateSlug} price={template?.price ?? 0} />
                      )}
                      <form action={deleteInvitationAction}>
                        <input type="hidden" name="id" value={inv.id} />
                        <button className="rounded-full px-4 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-maroon hover:underline">Delete</button>
                      </form>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
