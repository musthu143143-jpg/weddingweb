import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { couponStats, couponStatus, listCoupons } from "@/lib/coupons";
import AdminShell, { AdminCard, AdminHero, AdminTable, Td, Th } from "@/components/admin/AdminShell";
import { createCouponAction, deleteCouponAction, redeemCouponAction, toggleCouponAction } from "@/app/admin/coupons/actions";

export const metadata: Metadata = { title: "Admin Coupons", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function toLocalInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const STATUS_STYLES: Record<string, string> = {
  active: "border-sage/50 bg-sage/10 text-sage",
  scheduled: "border-gold/50 bg-gold/10 text-gold",
  redeemed: "border-burgundy/40 bg-burgundy/10 text-burgundy",
  expired: "border-ink-soft/30 bg-ink-soft/10 text-ink-soft",
  disabled: "border-maroon/30 bg-maroon/10 text-maroon",
};

export default async function AdminCouponsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const ctx = await requireAdmin();
  const params = await searchParams;
  const [rows, stats] = await Promise.all([listCoupons(params.q), couponStats()]);

  const now = new Date();
  const defaultStart = toLocalInput(now);
  const defaultExpiry = toLocalInput(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

  return (
    <AdminShell active="/admin/coupons" email={ctx.email}>
      <AdminHero
        eyebrow="Promotions"
        title="Coupons"
        sub="Create unique, single-use coupon codes with a start time and expiry. Each code can be redeemed exactly once."
      />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <Stat label="Total" value={stats.total} />
          <Stat label="Active" value={stats.active} />
          <Stat label="Scheduled" value={stats.scheduled} />
          <Stat label="Redeemed" value={stats.redeemed} />
          <Stat label="Expired" value={stats.expired} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <AdminCard>
            <h2 className="font-display text-3xl font-medium text-charcoal">Create coupon</h2>
            <p className="mt-2 font-sans text-[13px] font-light text-ink-soft/65">
              Leave the code blank to auto-generate a unique code. Codes are stored uppercase and enforced unique in the database.
            </p>
            <form action={createCouponAction} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="admin-label">Coupon code (optional)</span>
                <input name="code" placeholder="Auto-generate if empty" className="admin-input uppercase" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Discount type</span>
                <select name="discountType" defaultValue="percent" className="admin-input">
                  <option value="percent">Percentage (%)</option>
                  <option value="amount">Fixed amount (₹)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Discount value</span>
                <input name="discountValue" type="number" min={1} defaultValue={15} className="admin-input" required />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Valid from</span>
                <input name="startsAt" type="datetime-local" defaultValue={defaultStart} className="admin-input" required />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Expires at</span>
                <input name="expiresAt" type="datetime-local" defaultValue={defaultExpiry} className="admin-input" required />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="admin-label">Description</span>
                <input name="description" placeholder="Launch offer for early couples" className="admin-input" />
              </label>
              <label className="flex items-center gap-3 sm:col-span-2">
                <input type="checkbox" name="active" value="true" defaultChecked className="h-4 w-4 accent-burgundy" />
                <span className="admin-label">Activate immediately</span>
              </label>
              <div className="sm:col-span-2">
                <button className="inline-flex items-center gap-2 rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory">
                  <Ticket className="h-3.5 w-3.5" strokeWidth={1.8} /> Create coupon
                </button>
              </div>
            </form>
          </AdminCard>

          <AdminCard>
            <h2 className="font-display text-3xl font-medium text-charcoal">Redeem / validate</h2>
            <p className="mt-2 font-sans text-[13px] font-light text-ink-soft/65">
              Redeeming marks a coupon used permanently. A second attempt with the same code will be rejected.
            </p>
            <form action={redeemCouponAction} className="mt-6 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Coupon code</span>
                <input name="code" placeholder="CEL-XXXXXXXX" className="admin-input uppercase" required />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Redeemed by (optional)</span>
                <input name="redeemedBy" placeholder="customer@example.com" className="admin-input" />
              </label>
              <button className="w-full rounded-full border border-gold/50 px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-burgundy hover:bg-gold/10">
                Redeem coupon
              </button>
            </form>
            <p className="mt-4 font-sans text-[11.5px] font-light leading-relaxed text-ink-soft/55">
              Redemption is atomic: the database only marks codes that are unredeemed, active and inside their validity window.
            </p>
          </AdminCard>
        </div>

        <form className="mt-10 mb-5 flex gap-3">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Search code or description..." className="min-w-0 flex-1 rounded-full border border-gold/30 bg-white/80 px-5 py-3 font-sans text-[14px] outline-none focus:border-gold" />
          <button className="rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory">Search</button>
        </form>

        <AdminTable>
          <thead>
            <tr><Th>Code</Th><Th>Discount</Th><Th>Window</Th><Th>Status</Th><Th>Redeemed by</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-14 text-center font-sans text-[13px] font-light text-ink-soft/60">No coupons yet. Create your first coupon above.</td></tr>
            ) : rows.map((c) => {
              const status = couponStatus(c, now);
              return (
                <tr key={c.id}>
                  <Td className="font-mono text-[13px] font-medium text-charcoal">
                    {c.code}
                    {c.description && <span className="mt-1 block font-sans text-[11.5px] font-light text-ink-soft/60">{c.description}</span>}
                  </Td>
                  <Td>{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue.toLocaleString("en-IN")}`}</Td>
                  <Td>
                    <span className="block">{c.startsAt.toLocaleString()}</span>
                    <span className="block text-ink-soft/60">→ {c.expiresAt.toLocaleString()}</span>
                  </Td>
                  <Td>
                    <span className={`inline-flex rounded-full border px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 ${STATUS_STYLES[status]}`}>{status}</span>
                  </Td>
                  <Td>
                    {c.redeemedAt ? (
                      <>
                        <span className="block">{c.redeemedBy || "—"}</span>
                        <span className="block text-ink-soft/60">{c.redeemedAt.toLocaleString()}</span>
                      </>
                    ) : "—"}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      {!c.redeemedAt && (
                        <form action={toggleCouponAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="active" value={(!c.active).toString()} />
                          <button className="font-sans text-[11px] uppercase tracking-wide-2 text-burgundy">{c.active ? "Disable" : "Enable"}</button>
                        </form>
                      )}
                      <form action={deleteCouponAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="font-sans text-[11px] uppercase tracking-wide-2 text-maroon">Delete</button>
                      </form>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      </section>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <AdminCard>
      <p className="font-display text-4xl font-semibold text-charcoal">{value}</p>
      <p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">{label}</p>
    </AdminCard>
  );
}
