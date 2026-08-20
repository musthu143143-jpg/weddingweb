import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { listUnlockKeys } from "@/lib/orders";
import { TEMPLATES } from "@/data/templates";
import AdminShell, { AdminCard, AdminHero, AdminTable, Td, Th } from "@/components/admin/AdminShell";
import CopyCode from "@/components/admin/CopyCode";
import { generateKeysAction, revokeKeyAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Admin Unlock Keys", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  available: "border-sage/50 bg-sage/10 text-sage",
  used: "border-gold/40 bg-gold/10 text-gold",
  revoked: "border-maroon/30 bg-maroon/8 text-maroon",
};

export default async function AdminKeysPage() {
  const ctx = await requireAdmin();
  const keys = await listUnlockKeys();

  return (
    <AdminShell active="/admin/keys" email={ctx.email}>
      <AdminHero
        eyebrow="Offline payments"
        title="Unlock Keys"
        sub="Generate one-time secret keys for a design (its price is baked in) or a custom amount, then send them after confirming a UPI / bank payment. A key unlocks publishing for exactly one invitation."
      />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <AdminCard>
            <h2 className="flex items-center gap-2 font-display text-2xl font-medium text-charcoal">
              <KeyRound className="h-5 w-5 text-gold" strokeWidth={1.7} /> Generate keys
            </h2>
            <form action={generateKeysAction} className="mt-5 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Design (price auto-filled)</span>
                <select name="templateSlug" defaultValue={TEMPLATES[0].slug} className="admin-input">
                  {TEMPLATES.map((t) => (
                    <option key={t.slug} value={t.slug}>{t.name} — ₹{t.price.toLocaleString("en-IN")}</option>
                  ))}
                  <option value="__custom__">Custom amount (any design)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Custom amount ₹ (only for “Custom amount”)</span>
                <input name="amount" type="number" min={1} placeholder="e.g. 1999" className="admin-input" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Quantity (1–25)</span>
                <input name="count" type="number" min={1} max={25} defaultValue={1} className="admin-input" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="admin-label">Note (optional)</span>
                <input name="note" placeholder="e.g. WhatsApp order #1042" className="admin-input" />
              </label>
              <button className="w-full rounded-full bg-burgundy py-3.5 font-sans text-[12px] font-medium uppercase tracking-luxe text-ivory transition-transform hover:-translate-y-0.5">
                Generate
              </button>
            </form>
          </AdminCard>

          <AdminTable>
            <thead>
              <tr><Th>Key</Th><Th>Design</Th><Th>Amount</Th><Th>Status</Th><Th>Used by</Th><Th>Actions</Th></tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr><Td className="py-12 text-center">No keys yet. Generate your first key on the left.</Td></tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id}>
                    <Td className="font-mono text-[12.5px] font-medium text-charcoal">
                      {k.code}
                      <CopyCode value={k.code} />
                    </Td>
                    <Td className="capitalize">{k.templateSlug ?? "Any design"}</Td>
                    <Td>₹{k.amount.toLocaleString("en-IN")}</Td>
                    <Td>
                      <span className={`rounded-full border px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 ${STATUS_STYLES[k.status] ?? ""}`}>{k.status}</span>
                    </Td>
                    <Td>
                      {k.usedAt ? (
                        <span className="block">
                          <span className="block truncate">{k.usedBy?.slice(0, 8)}…</span>
                          <span className="block text-ink-soft/50">{k.usedAt.toLocaleString()}</span>
                        </span>
                      ) : "—"}
                    </Td>
                    <Td>
                      {k.status === "available" ? (
                        <form action={revokeKeyAction}>
                          <input type="hidden" name="id" value={k.id} />
                          <button className="font-sans text-[11px] uppercase tracking-wide-2 text-maroon hover:underline">Revoke</button>
                        </form>
                      ) : "—"}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTable>
        </div>
      </section>
    </AdminShell>
  );
}
