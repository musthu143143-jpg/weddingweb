import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { listCustomers } from "@/lib/adminData";
import AdminShell, { AdminHero, AdminTable, Td, Th } from "@/components/admin/AdminShell";
import RoleSelect from "@/app/admin/RoleSelect";

export const metadata: Metadata = { title: "Admin Customers", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const ctx = await requireAdmin();
  const params = await searchParams;
  const people = (await listCustomers(params.q)).filter((p) => !params.role || p.role === params.role);

  return (
    <AdminShell active="/admin/customers" email={ctx.email}>
      <AdminHero eyebrow="Access control" title="Customers & roles" sub="View every real account created through Supabase Auth and manage their app role." />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <form className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Search email, name, business..." className="min-w-0 flex-1 rounded-full border border-gold/30 bg-white/80 px-5 py-3 font-sans text-[14px] outline-none focus:border-gold" />
          <select name="role" defaultValue={params.role ?? ""} className="rounded-full border border-gold/30 bg-white/80 px-5 py-3 font-sans text-[12px] uppercase tracking-wide-2 outline-none focus:border-gold">
            <option value="">All roles</option><option value="user">Users</option><option value="reseller">Resellers</option><option value="admin">Admins</option>
          </select>
          <button className="rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory">Search</button>
        </form>

        <AdminTable>
          <thead><tr><Th>Email</Th><Th>Name</Th><Th>Business</Th><Th>Phone</Th><Th>Role</Th><Th>Joined</Th></tr></thead>
          <tbody>
            {people.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-14 text-center font-sans text-[13px] font-light text-ink-soft/60">No matching accounts found.</td></tr>
            ) : people.map((p) => (
              <tr key={p.id}>
                <Td className="font-medium text-charcoal">{p.email}</Td>
                <Td>{p.fullName || "—"}</Td>
                <Td>{p.businessName || "—"}</Td>
                <Td>{p.phone || "—"}</Td>
                <Td><RoleSelect userId={p.id} currentRole={p.role} disabled={p.id === ctx.userId} /></Td>
                <Td>{p.createdAt.toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </section>
    </AdminShell>
  );
}
