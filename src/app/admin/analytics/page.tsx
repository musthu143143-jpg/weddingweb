import type { Metadata } from "next";
import { BarChart3, ClipboardList, LayoutTemplate, Mail, Users } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { getOperationalAnalytics } from "@/lib/adminData";
import AdminShell, { AdminCard, AdminHero } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin Analytics", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const ctx = await requireAdmin();
  const a = await getOperationalAnalytics();
  const totalOrders = a.orders.pending + a.orders.paid + a.orders.fulfilled + a.orders.cancelled;

  return (
    <AdminShell active="/admin/analytics" email={ctx.email}>
      <AdminHero eyebrow="Analytics" title="Operational analytics" sub="Only real rows from your database are counted here. No sample revenue, no fake customers." />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Users} label="Accounts" value={a.totalProfiles} helper={`${a.roles.user} couples · ${a.roles.reseller} resellers · ${a.roles.admin} admins`} />
          <Metric icon={LayoutTemplate} label="Published Templates" value={a.publishedTemplates} helper={`${a.premiumTemplates} premium templates`} />
          <Metric icon={ClipboardList} label="Orders" value={totalOrders} helper={`₹${a.revenue.toLocaleString("en-IN")} recorded value`} />
          <Metric icon={Mail} label="RSVPs" value={a.rsvps} helper={`${a.publishedInvitations} published invitations`} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <AdminCard>
            <h2 className="font-display text-3xl font-medium text-charcoal">Order pipeline</h2>
            <div className="mt-6 space-y-4">
              {Object.entries(a.orders).map(([status, count]) => <Bar key={status} label={status} value={count} max={Math.max(totalOrders, 1)} />)}
            </div>
          </AdminCard>
          <AdminCard>
            <h2 className="font-display text-3xl font-medium text-charcoal">Account mix</h2>
            <div className="mt-6 space-y-4">
              {Object.entries(a.roles).map(([role, count]) => <Bar key={role} label={role} value={count} max={Math.max(a.totalProfiles, 1)} />)}
            </div>
          </AdminCard>
        </div>

        <AdminCard className="mt-8">
          <div className="flex items-start gap-4">
            <BarChart3 className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.6} />
            <div>
              <h2 className="font-display text-2xl font-medium text-charcoal">Data policy</h2>
              <p className="mt-2 max-w-3xl font-sans text-[14px] font-light leading-relaxed text-ink-soft/70">
                Analytics are intentionally conservative in this phase. They are computed from current database rows only. When payments, published invitation hosting and RSVP capture are connected, this page will automatically become more informative without inventing numbers.
              </p>
            </div>
          </div>
        </AdminCard>
      </section>
    </AdminShell>
  );
}
function Metric({ icon: Icon, label, value, helper }: { icon: typeof Users; label: string; value: number; helper: string }) {
  return <AdminCard><Icon className="h-5 w-5 text-gold" strokeWidth={1.6} /><p className="mt-5 font-display text-4xl font-semibold text-charcoal">{value}</p><p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">{label}</p><p className="mt-3 font-sans text-[12px] font-light text-ink-soft/55">{helper}</p></AdminCard>;
}
function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return <div><div className="flex justify-between font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60"><span>{label}</span><span>{value}</span></div><div className="mt-2 h-2 rounded-full bg-gold/10"><div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} /></div></div>;
}
