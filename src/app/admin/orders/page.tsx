import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { listOrders } from "@/lib/adminData";
import { TEMPLATES } from "@/data/templates";
import AdminShell, { AdminCard, AdminHero, AdminTable, Td, Th } from "@/components/admin/AdminShell";
import { changeOrderStatusAction, createOrderAction, deleteOrderAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Admin Orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const ctx = await requireAdmin();
  const params = await searchParams;
  const rows = await listOrders(params.q);

  return (
    <AdminShell active="/admin/orders" email={ctx.email}>
      <AdminHero eyebrow="Commerce" title="Orders" sub="Record and manage real order entries. Payment gateway integration can later write into this same table." />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <form className="mb-6 flex gap-3">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Search customer, plan, status..." className="min-w-0 flex-1 rounded-full border border-gold/30 bg-white/80 px-5 py-3 font-sans text-[14px] outline-none focus:border-gold" />
          <button className="rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory">Search</button>
        </form>

        <AdminTable>
          <thead><tr><Th>Customer</Th><Th>Template</Th><Th>Plan</Th><Th>Amount</Th><Th>Status</Th><Th>Created</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={7} className="px-6 py-14 text-center font-sans text-[13px] font-light text-ink-soft/60">No orders yet. Create a manual order below or connect payments later.</td></tr> : rows.map((o) => (
              <tr key={o.id}>
                <Td className="font-medium text-charcoal">{o.customerEmail}</Td><Td>{o.templateSlug || "—"}</Td><Td>{o.plan}</Td><Td>₹{o.amount.toLocaleString("en-IN")}</Td>
                <Td>
                  <form action={changeOrderStatusAction} className="flex gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} className="rounded-full border border-gold/30 bg-white px-3 py-1.5 font-sans text-[11px] uppercase tracking-wide-2">
                      <option value="pending">Pending</option><option value="paid">Paid</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option>
                    </select>
                    <button className="font-sans text-[11px] uppercase tracking-wide-2 text-burgundy">Save</button>
                  </form>
                </Td>
                <Td>{o.createdAt.toLocaleDateString()}</Td>
                <Td><form action={deleteOrderAction}><input type="hidden" name="id" value={o.id} /><button className="font-sans text-[11px] uppercase tracking-wide-2 text-maroon">Delete</button></form></Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>

        <AdminCard className="mt-10">
          <h2 className="font-display text-3xl font-medium text-charcoal">Create manual order</h2>
          <p className="mt-2 font-sans text-[13px] font-light text-ink-soft/65">Use this for offline payments, reseller orders, or support-created orders.</p>
          <form action={createOrderAction} className="mt-6 grid gap-4 lg:grid-cols-2">
            <Field name="customerEmail" label="Customer email" />
            <Field name="plan" label="Plan" value="Signature" />
            <label className="flex flex-col gap-1.5"><span className="admin-label">Template</span><select name="templateSlug" className="admin-input"><option value="">Not selected</option>{TEMPLATES.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}</select></label>
            <Field name="amount" label="Amount (INR)" type="number" value="1999" />
            <label className="flex flex-col gap-1.5"><span className="admin-label">Status</span><select name="status" defaultValue="pending" className="admin-input"><option value="pending">Pending</option><option value="paid">Paid</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option></select></label>
            <Field name="customerId" label="Customer profile id (optional)" />
            <Field name="resellerId" label="Reseller profile id (optional)" />
            <label className="flex flex-col gap-1.5 lg:col-span-2"><span className="admin-label">Notes</span><textarea name="notes" rows={3} className="admin-input resize-none" /></label>
            <div className="lg:col-span-2"><button className="rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory">Create order</button></div>
          </form>
        </AdminCard>
      </section>
    </AdminShell>
  );
}
function Field({ name, label, value = "", type = "text" }: { name: string; label: string; value?: string; type?: string }) {
  return <label className="flex flex-col gap-1.5"><span className="admin-label">{label}</span><input name={name} type={type} defaultValue={value} className="admin-input" /></label>;
}

