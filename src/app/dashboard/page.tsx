import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, Heart, Mail, Palette, Users } from "lucide-react";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getAuthedContext, homeForRole } from "@/lib/authGuard";
import { getUserStats } from "@/lib/invitations";
import { BRAND } from "@/data/content";
import { TEMPLATES } from "@/data/templates";
import { Ornament } from "@/components/ui/core";
import DashboardShell, { Card, DashboardHero, EmptyState } from "@/components/dashboard/DashboardShell";
import { createInvitationAction } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Your Studio",
  description: `Your ${BRAND.name} invitation studio.`,
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!getSupabaseConfig()) redirect("/login?setup=1");

  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login");
  if (ctx.profile.role !== "user") redirect(homeForRole(ctx.profile.role));

  const stats = await getUserStats(ctx.userId, ctx.email);
  const fullName = ctx.profile.fullName ?? "";
  const firstName = fullName.split("&")[0]?.trim().split(" ")[0] || "there";
  const recent = stats.invitations.slice(0, 3);

  return (
    <DashboardShell active="/dashboard" email={ctx.email}>
      <DashboardHero
        eyebrow="Your studio"
        title={`Welcome, ${firstName}.`}
        sub="Create an invitation, track every guest response, and share your story — all from one place."
      />

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={Heart} label="Invitations" value={stats.total} helper={`${stats.drafts} draft · ${stats.published} live`} />
          <Stat icon={Mail} label="RSVP Responses" value={stats.rsvps.length} helper={`${stats.attending} accepted`} />
          <Stat icon={Users} label="Guests Attending" value={stats.guests} helper="Total seats confirmed" />
          <Stat icon={Palette} label="Designs Available" value={TEMPLATES.length} helper="Ready to customise" />
        </div>

        {/* Start a new invitation */}
        <Card className="mt-10">
          <h2 className="font-display text-3xl font-medium text-charcoal">Start a new invitation</h2>
          <p className="mt-2 font-sans text-[13.5px] font-light text-ink-soft/70">
            Give it a name and pick a design. It will be saved to your account so you can return anytime.
          </p>
          <form action={createInvitationAction} className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_1fr_auto]">
            <label className="flex flex-col gap-1.5">
              <span className="admin-label">Invitation name</span>
              <input name="title" placeholder="Aarav & Meera" className="admin-input" required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="admin-label">Template</span>
              <select name="templateSlug" className="admin-input">
                {TEMPLATES.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
              </select>
            </label>
            <div className="flex items-end">
              <button className="w-full rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory sm:w-auto">
                Create
              </button>
            </div>
          </form>
        </Card>

        {/* Recent invitations */}
        <div className="mt-14 flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-medium text-charcoal">Your invitations</h2>
          <Link href="/dashboard/invitations" className="font-sans text-[11px] uppercase tracking-wide-2 text-burgundy">View all →</Link>
        </div>
        <Ornament style="royal" className="mt-4 h-4 w-36 text-gold/60" />

        <div className="mt-8">
          {recent.length === 0 ? (
            <EmptyState
              title="No invitations yet"
              text="Create your first invitation above, or explore the collection to find a design that feels like your story."
              cta={<Link href="/templates" className="rounded-full border border-gold/50 px-6 py-3 font-sans text-[11px] uppercase tracking-wide-2 text-burgundy hover:bg-gold/10">Browse templates</Link>}
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {recent.map((inv) => {
                const template = TEMPLATES.find((t) => t.slug === inv.templateSlug);
                return (
                  <Card key={inv.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full border px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 ${inv.published ? "border-sage/50 bg-sage/10 text-sage" : "border-gold/40 bg-gold/10 text-gold"}`}>
                        {inv.published ? "Live" : "Draft"}
                      </span>
                      <span className="font-sans text-[11px] text-ink-soft/50">{inv.updatedAt.toLocaleDateString()}</span>
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-charcoal">{inv.title}</h3>
                    <p className="mt-1 font-sans text-[12px] font-light text-ink-soft/60">{template?.name ?? inv.templateSlug}</p>
                    <div className="mt-5 flex gap-2">
                      <Link href={`/customize/${inv.templateSlug}?invitation=${inv.id}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-burgundy py-2.5 font-sans text-[10px] uppercase tracking-wide-2 text-ivory">
                        <Palette className="h-3 w-3" /> Edit
                      </Link>
                      <Link href={`/templates/${inv.templateSlug}`} aria-label="Preview design" className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-burgundy">
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Link href="/templates" className="mt-12 flex items-center justify-between gap-4 rounded-2xl border border-gold/20 bg-gold-pale/30 p-7 transition-colors hover:border-gold/40">
          <div>
            <p className="font-display text-xl font-semibold text-charcoal">Explore the full collection</p>
            <p className="mt-1 font-sans text-[13px] font-light text-ink-soft/70">{TEMPLATES.length} handcrafted designs across every tradition.</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-gold" />
        </Link>
      </section>
    </DashboardShell>
  );
}

function Stat({ icon: Icon, label, value, helper }: { icon: typeof Heart; label: string; value: number; helper: string }) {
  return (
    <Card>
      <Icon className="h-5 w-5 text-gold" strokeWidth={1.6} />
      <p className="mt-5 font-display text-4xl font-semibold text-charcoal">{value}</p>
      <p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">{label}</p>
      <p className="mt-2 font-sans text-[12px] font-light text-ink-soft/55">{helper}</p>
    </Card>
  );
}
