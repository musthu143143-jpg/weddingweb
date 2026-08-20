import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthedContext, homeForRole } from "@/lib/authGuard";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { listUserRsvps } from "@/lib/invitations";
import DashboardShell, { Card, DashboardHero, EmptyState } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: "RSVPs" };
export const dynamic = "force-dynamic";

export default async function RsvpsPage() {
  if (!getSupabaseConfig()) redirect("/login?setup=1");
  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login");
  if (ctx.profile.role !== "user") redirect(homeForRole(ctx.profile.role));

  const rows = await listUserRsvps(ctx.userId);
  const attending = rows.filter((r) => r.attending);
  const seats = attending.reduce((sum, r) => sum + (r.guests ?? 0), 0);

  return (
    <DashboardShell active="/dashboard/rsvps" email={ctx.email}>
      <DashboardHero eyebrow="Your guests" title="RSVP Responses" sub="Every reply your guests send to a published invitation appears here." />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <Stat label="Total responses" value={rows.length} />
          <Stat label="Joyfully accepted" value={attending.length} />
          <Stat label="Seats confirmed" value={seats} />
        </div>

        <div className="mt-10">
          {rows.length === 0 ? (
            <EmptyState
              title="No responses yet"
              text="Once you publish an invitation and share its link, every guest reply will collect here automatically."
              cta={<Link href="/dashboard/invitations" className="rounded-full bg-burgundy px-6 py-3 font-sans text-[11px] uppercase tracking-wide-2 text-ivory">Publish an invitation</Link>}
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gold/20 bg-white/70">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gold/20 bg-gold-pale/30">
                    {["Guest", "Invitation", "Response", "Guests", "Message", "Received"].map((h) => (
                      <th key={h} className="px-6 py-4 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-gold/10 last:border-0">
                      <Td className="font-medium text-charcoal">{r.guestName || "Guest"}</Td>
                      <Td>{r.invitationTitle}</Td>
                      <Td>
                        <span className={`rounded-full border px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 ${r.attending ? "border-sage/50 bg-sage/10 text-sage" : "border-maroon/30 bg-maroon/8 text-maroon"}`}>
                          {r.attending ? "Accepted" : "Declined"}
                        </span>
                      </Td>
                      <Td>{r.guests}</Td>
                      <Td className="max-w-xs">{r.message || "—"}</Td>
                      <Td>{r.createdAt.toLocaleDateString()}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="font-display text-4xl font-semibold text-charcoal">{value}</p>
      <p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">{label}</p>
    </Card>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 font-sans text-[13px] font-light text-ink-soft ${className}`}>{children}</td>;
}
