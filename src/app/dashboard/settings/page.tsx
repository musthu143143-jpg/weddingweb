import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthedContext, homeForRole } from "@/lib/authGuard";
import { getSupabaseConfig } from "@/lib/supabase/config";
import DashboardShell, { Card, DashboardHero } from "@/components/dashboard/DashboardShell";
import { saveProfileAction } from "@/app/dashboard/actions";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!getSupabaseConfig()) redirect("/login?setup=1");
  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login");
  if (ctx.profile.role !== "user") redirect(homeForRole(ctx.profile.role));

  return (
    <DashboardShell active="/dashboard/settings" email={ctx.email}>
      <DashboardHero eyebrow="Your account" title="Settings" sub="Update the details we use across your invitations." />
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-3xl font-medium text-charcoal">Profile</h2>
          <form action={saveProfileAction} className="mt-6 space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="admin-label">Your names</span>
              <input name="fullName" defaultValue={ctx.profile.fullName ?? ""} placeholder="Aarav & Meera" className="admin-input" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="admin-label">Phone</span>
              <input name="phone" defaultValue={ctx.profile.phone ?? ""} placeholder="+91 90000 00000" className="admin-input" />
            </label>
            <button className="rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory">Save changes</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-3xl font-medium text-charcoal">Account</h2>
          <dl className="mt-6 space-y-4">
            <Row label="Email" value={ctx.email ?? "—"} />
            <Row label="Account type" value={ctx.profile.role} />
          </dl>
          <p className="mt-6 rounded-xl bg-gold-pale/40 px-4 py-3 font-sans text-[12.5px] font-light leading-relaxed text-ink-soft/70">
            Your email and password are managed by Supabase Auth. To change your email address, contact support — self-service email changes arrive with the next release.
          </p>
        </Card>
      </section>
    </DashboardShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gold/15 pb-3">
      <dt className="admin-label">{label}</dt>
      <dd className="font-sans text-[14px] text-charcoal">{value}</dd>
    </div>
  );
}
