import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Briefcase, ClipboardList, LayoutTemplate, Mail, ShieldCheck, Users } from "lucide-react";
import { getAdminOverview } from "@/lib/adminData";
import { requireAdmin } from "@/lib/adminAuth";
import AdminShell, { AdminCard, AdminHero, AdminTable, Td, Th } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin Overview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const ctx = await requireAdmin();
  const overview = await getAdminOverview();

  return (
    <AdminShell active="/admin" email={ctx.email}>
      <AdminHero eyebrow="Platform admin" title="Studio overview" sub="Real operational data across accounts, templates, orders, invitations and RSVP responses." />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Accounts" value={overview.totalProfiles} href="/admin/customers" />
          <StatCard icon={Briefcase} label="Resellers" value={overview.roles.reseller} href="/admin/customers?role=reseller" />
          <StatCard icon={LayoutTemplate} label="DB Templates" value={overview.templates} href="/admin/templates" />
          <StatCard icon={ClipboardList} label="Orders" value={overview.orders.pending + overview.orders.paid + overview.orders.fulfilled + overview.orders.cancelled} href="/admin/orders" />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <AdminCard>
            <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Revenue</p>
            <p className="mt-4 font-display text-4xl font-semibold text-charcoal">₹{overview.revenue.toLocaleString("en-IN")}</p>
            <p className="mt-2 font-sans text-[13px] font-light text-ink-soft/65">Total recorded order value from real orders.</p>
          </AdminCard>
          <AdminCard>
            <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Invitations</p>
            <p className="mt-4 font-display text-4xl font-semibold text-charcoal">{overview.invitations}</p>
            <p className="mt-2 font-sans text-[13px] font-light text-ink-soft/65">Saved invitation records in the app database.</p>
          </AdminCard>
          <AdminCard>
            <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">RSVPs</p>
            <p className="mt-4 font-display text-4xl font-semibold text-charcoal">{overview.rsvps}</p>
            <p className="mt-2 font-sans text-[13px] font-light text-ink-soft/65">Guest responses captured from published invitations.</p>
          </AdminCard>
        </div>

        <div className="mt-8">
          <Link href="/admin/coupons" className="block rounded-2xl border border-gold/20 bg-white/70 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Coupons</p>
                <p className="mt-2 font-display text-2xl font-medium text-charcoal">Single-use promo codes</p>
                <p className="mt-1 font-sans text-[13px] font-light text-ink-soft/65">Unique codes with start and expiry windows, redeemable once each.</p>
              </div>
              <div className="flex gap-8">
                <MiniStat label="Total" value={overview.coupons.total} />
                <MiniStat label="Active" value={overview.coupons.active} />
                <MiniStat label="Redeemed" value={overview.coupons.redeemed} />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl font-medium text-charcoal">Recent accounts</h2>
              <Link href="/admin/customers" className="font-sans text-[11px] uppercase tracking-wide-2 text-burgundy">View all →</Link>
            </div>
            <AdminTable>
              <thead><tr><Th>Email</Th><Th>Role</Th><Th>Joined</Th></tr></thead>
              <tbody>
                {overview.recentProfiles.length === 0 ? <EmptyRow cols={3} label="No users have signed up yet." /> : overview.recentProfiles.map((p) => (
                  <tr key={p.id}><Td className="font-medium text-charcoal">{p.email}</Td><Td>{p.role}</Td><Td>{p.createdAt.toLocaleDateString()}</Td></tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl font-medium text-charcoal">Recent orders</h2>
              <Link href="/admin/orders" className="font-sans text-[11px] uppercase tracking-wide-2 text-burgundy">View all →</Link>
            </div>
            <AdminTable>
              <thead><tr><Th>Customer</Th><Th>Status</Th><Th>Amount</Th></tr></thead>
              <tbody>
                {overview.recentOrders.length === 0 ? <EmptyRow cols={3} label="No orders have been recorded yet." /> : overview.recentOrders.map((o) => (
                  <tr key={o.id}><Td className="font-medium text-charcoal">{o.customerEmail}</Td><Td>{o.status}</Td><Td>₹{o.amount.toLocaleString("en-IN")}</Td></tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function StatCard({ icon: Icon, label, value, href }: { icon: typeof Users; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-gold/20 bg-white/70 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
      <Icon className="h-5 w-5 text-gold" strokeWidth={1.6} />
      <p className="mt-5 font-display text-4xl font-semibold text-charcoal">{value}</p>
      <p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">{label}</p>
    </Link>
  );
}
function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-display text-3xl font-semibold text-charcoal">{value}</p>
      <p className="mt-1 font-sans text-[10px] uppercase tracking-wide-2 text-ink-soft/55">{label}</p>
    </div>
  );
}
function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return <tr><td colSpan={cols} className="px-6 py-10 text-center font-sans text-[13px] font-light text-ink-soft/60">{label}</td></tr>;
}
