import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Database, XCircle } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { getDbDiagnostics } from "@/lib/dbInfo";
import { getTemplates } from "@/lib/templatesService";
import AdminShell, { AdminCard, AdminHero, AdminTable, Td, Th } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin Database", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminDatabasePage() {
  const ctx = await requireAdmin();
  const [info, templateSource] = await Promise.all([getDbDiagnostics(), getTemplates()]);
  const onSupabase = info.source === "supabase" && info.reachable;

  return (
    <AdminShell active="/admin/database" email={ctx.email}>
      <AdminHero
        eyebrow="Infrastructure"
        title="Database connection"
        sub="Where templates, accounts, orders, invitations and coupons are actually stored right now."
      />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div
          className={`flex items-start gap-4 rounded-2xl border p-6 ${
            onSupabase ? "border-sage/40 bg-sage/8" : "border-gold/40 bg-gold/8"
          }`}
        >
          {onSupabase ? (
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-sage" strokeWidth={1.7} />
          ) : (
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-gold" strokeWidth={1.7} />
          )}
          <div>
            <h2 className="font-display text-2xl font-medium text-charcoal">
              {onSupabase ? "Connected to Supabase Postgres" : "Running on the local sandbox database"}
            </h2>
            <p className="mt-2 max-w-3xl font-sans text-[14px] font-light leading-relaxed text-ink-soft/75">
              {onSupabase
                ? "All application data is being read from and written to your Supabase project."
                : "Supabase Auth and Storage are live, but application data is still stored in the sandbox Postgres. Set a valid SUPABASE_DB_URL to migrate everything to Supabase — no application code needs to change."}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <AdminCard>
            <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Active connection</p>
            <dl className="mt-5 space-y-3">
              <Row label="Source" value={info.source === "supabase" ? "SUPABASE_DB_URL" : "DATABASE_URL (local)"} />
              <Row label="Host" value={info.host} />
              <Row label="Reachable" value={info.reachable ? "Yes" : "No"} />
              <Row label="Database" value={info.database ?? "—"} />
              <Row label="Server version" value={info.serverVersion ?? "—"} />
            </dl>
            {info.error && (
              <p className="mt-4 rounded-xl border border-maroon/25 bg-maroon/5 px-4 py-3 font-sans text-[12px] leading-relaxed text-maroon">
                {info.error}
              </p>
            )}
          </AdminCard>

          <AdminCard>
            <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Supabase services</p>
            <dl className="mt-5 space-y-3">
              <Row label="Auth + Storage URL" value={info.supabaseUrlConfigured ? "Configured" : "Missing"} />
              <Row label="Database URL" value={info.supabaseDbUrlConfigured ? "Provided" : "Not set"} />
              <Row
                label="Templates served from"
                value={templateSource.origin === "database" ? `Database (${templateSource.templates.length})` : `Static collection (${templateSource.templates.length})`}
              />
            </dl>
            <p className="mt-4 font-sans text-[12.5px] font-light leading-relaxed text-ink-soft/65">
              The public marketplace automatically prefers database templates. Use{" "}
              <span className="text-burgundy">Admin → Templates → Sync static collection</span> to publish the
              built-in designs into the database.
            </p>
          </AdminCard>
        </div>

        <h2 className="mt-12 font-display text-3xl font-medium text-charcoal">Tables</h2>
        <div className="mt-5">
          <AdminTable>
            <thead>
              <tr><Th>Table</Th><Th>Status</Th><Th>Rows</Th></tr>
            </thead>
            <tbody>
              {info.tables.map((t) => (
                <tr key={t.name}>
                  <Td className="font-mono text-[13px] font-medium text-charcoal">{t.name}</Td>
                  <Td>
                    {t.present ? (
                      <span className="inline-flex items-center gap-1.5 text-sage"><CheckCircle2 className="h-3.5 w-3.5" /> present</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-maroon"><XCircle className="h-3.5 w-3.5" /> missing</span>
                    )}
                  </Td>
                  <Td>{t.rows ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </div>

        <AdminCard className="mt-10">
          <div className="flex items-start gap-4">
            <Database className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.6} />
            <div>
              <h3 className="font-display text-2xl font-medium text-charcoal">Connecting to Supabase</h3>
              <ol className="mt-4 space-y-3 font-sans text-[13.5px] font-light leading-relaxed text-ink-soft/75">
                <li><span className="text-burgundy">1.</span> Run <code className="rounded bg-gold/10 px-1.5 py-0.5">supabase/sql/000_full_schema.sql</code> in the Supabase SQL Editor to create every table.</li>
                <li><span className="text-burgundy">2.</span> In Supabase → Project Settings → Database, copy the <strong>Session pooler</strong> connection string (the direct <code className="rounded bg-gold/10 px-1.5 py-0.5">db.*.supabase.co</code> host is IPv6-only and unreachable from many hosts).</li>
                <li><span className="text-burgundy">3.</span> Set it as <code className="rounded bg-gold/10 px-1.5 py-0.5">SUPABASE_DB_URL</code>, replacing <code className="rounded bg-gold/10 px-1.5 py-0.5">[YOUR-PASSWORD]</code> with your database password (Settings → Database → Reset database password if unknown — it is <em>not</em> your API key).</li>
                <li><span className="text-burgundy">4.</span> Restart, then reload this page — it will report Supabase as the active source.</li>
              </ol>
            </div>
          </div>
        </AdminCard>
      </section>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gold/15 pb-2.5">
      <dt className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/55">{label}</dt>
      <dd className="max-w-[60%] truncate text-right font-sans text-[13px] text-charcoal">{value}</dd>
    </div>
  );
}
