import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthedContext, homeForRole } from "@/lib/authGuard";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { listUserOrders } from "@/lib/invitations";
import DashboardShell, { DashboardHero, EmptyState } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  if (!getSupabaseConfig()) redirect("/login?setup=1");
  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login");
  if (ctx.profile.role !== "user") redirect(homeForRole(ctx.profile.role));

  const rows = await listUserOrders(ctx.userId, ctx.email);

  return (
    <DashboardShell active="/dashboard/orders" email={ctx.email}>
      <DashboardHero eyebrow="Billing" title="Your Orders" sub="Every order recorded against your account." />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {rows.length === 0 ? (
          <EmptyState
            title="No orders yet"
            text="Orders appear here once a plan is purchased for your invitation. Online payments are not connected yet, so an administrator can also record an order for you."
            cta={<Link href="/pricing" className="rounded-full border border-gold/50 px-6 py-3 font-sans text-[11px] uppercase tracking-wide-2 text-burgundy hover:bg-gold/10">View pricing</Link>}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gold/20 bg-white/70">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gold/20 bg-gold-pale/30">
                  {["Plan", "Template", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="px-6 py-4 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="border-b border-gold/10 last:border-0">
                    <td className="px-6 py-4 font-sans text-[13px] font-medium text-charcoal">{o.plan}</td>
                    <td className="px-6 py-4 font-sans text-[13px] font-light text-ink-soft">{o.templateSlug || "—"}</td>
                    <td className="px-6 py-4 font-sans text-[13px] font-light text-ink-soft">₹{o.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 text-gold">{o.status}</span>
                    </td>
                    <td className="px-6 py-4 font-sans text-[13px] font-light text-ink-soft">{o.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
