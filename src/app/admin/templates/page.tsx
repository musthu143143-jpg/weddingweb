import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { listAdminTemplates } from "@/lib/adminData";
import { TEMPLATES } from "@/data/templates";
import AdminShell, { AdminCard, AdminHero, AdminTable, Td, Th } from "@/components/admin/AdminShell";
import { createTemplateAction, deleteTemplateAction, seedTemplatesAction, updateTemplateAction } from "@/app/admin/actions";
import ThemeField from "@/app/admin/templates/ThemeField";

export const metadata: Metadata = { title: "Admin Templates", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const ctx = await requireAdmin();
  const params = await searchParams;
  const rows = await listAdminTemplates(params.q);
  const fallback = TEMPLATES[0];

  return (
    <AdminShell active="/admin/templates" email={ctx.email}>
      <AdminHero eyebrow="Template CMS" title="Templates" sub="Manage template records stored in the app database. The public marketplace still reads the curated static collection until the publishing engine is connected." />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form className="flex flex-1 gap-3">
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search templates..." className="min-w-0 flex-1 rounded-full border border-gold/30 bg-white/80 px-5 py-3 font-sans text-[14px] outline-none focus:border-gold" />
            <button className="rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory">Search</button>
          </form>
          <form action={seedTemplatesAction}>
            <button className="rounded-full border border-gold/50 px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-burgundy hover:bg-gold/10">Sync static collection</button>
          </form>
        </div>

        <AdminTable>
          <thead><tr><Th>Name</Th><Th>Slug</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={5} className="px-6 py-14 text-center font-sans text-[13px] font-light text-ink-soft/60">No database templates yet. Click “Sync static collection” to seed the CMS.</td></tr> : rows.map((t) => (
              <tr key={t.id}>
                <Td className="font-medium text-charcoal">{t.name}</Td><Td>{t.slug}</Td><Td>₹{t.price.toLocaleString("en-IN")}</Td><Td>{t.status}</Td>
                <Td>
                  <details className="group">
                    <summary className="cursor-pointer font-sans text-[11px] uppercase tracking-wide-2 text-burgundy">Edit</summary>
                    <div className="mt-4 min-w-[720px] rounded-2xl border border-gold/20 bg-ivory p-5">
                      <TemplateForm action={updateTemplateAction} submit="Save template" template={t} />
                      <form action={deleteTemplateAction} className="mt-3">
                        <input type="hidden" name="id" value={t.id} />
                        <button className="font-sans text-[11px] uppercase tracking-wide-2 text-maroon underline-offset-4 hover:underline">Delete template record</button>
                      </form>
                    </div>
                  </details>
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>

        <AdminCard className="mt-10">
          <h2 className="font-display text-3xl font-medium text-charcoal">Create template record</h2>
          <p className="mt-2 font-sans text-[13px] font-light text-ink-soft/65">Creates a real database template row. Use JSON for the theme field.</p>
          <div className="mt-6"><TemplateForm action={createTemplateAction} submit="Create template" template={{ ...fallback, id: "", status: "draft" }} /></div>
        </AdminCard>
      </section>
    </AdminShell>
  );
}

function TemplateForm({ action, submit, template }: { action: (formData: FormData) => void | Promise<void>; submit: string; template: any }) {
  return (
    <form action={action} className="grid gap-4 lg:grid-cols-2">
      {template.id && <input type="hidden" name="id" value={template.id} />}
      <Field name="name" label="Name" value={template.name} />
      <Field name="slug" label="Slug" value={template.slug} />
      <Field name="tagline" label="Tagline" value={template.tagline ?? ""} />
      <Field name="price" label="Price" value={String(template.price ?? 0)} type="number" />
      <Field name="image" label="Preview image URL" value={template.image ?? ""} />
      <Field name="imageAlt" label="Image alt" value={template.imageAlt ?? ""} />
      <Field name="categories" label="Categories (comma-separated)" value={(template.categories ?? []).join(", ")} />
      <Field name="style" label="Styles (comma-separated)" value={(template.style ?? []).join(", ")} />
      <Field name="features" label="Features (comma-separated)" value={(template.features ?? []).join(", ")} />
      <Field name="sections" label="Sections (comma-separated)" value={(template.sections ?? []).join(", ")} />
      <label className="flex flex-col gap-1.5"><span className="admin-label">Status</span><select name="status" defaultValue={template.status ?? "draft"} className="admin-input"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
      <label className="flex items-center gap-3 pt-6"><input type="checkbox" name="premium" defaultChecked={Boolean(template.premium)} className="h-4 w-4 accent-burgundy" /><span className="admin-label">Premium</span></label>
      <label className="flex flex-col gap-1.5 lg:col-span-2"><span className="admin-label">Description</span><textarea name="description" defaultValue={template.description ?? ""} rows={3} className="admin-input resize-none" /></label>
      <ThemeField initial={template.theme} />
      <div className="lg:col-span-2"><button className="rounded-full bg-burgundy px-7 py-3 font-sans text-[12px] uppercase tracking-wide-2 text-ivory">{submit}</button></div>
    </form>
  );
}
function Field({ name, label, value, type = "text" }: { name: string; label: string; value: string; type?: string }) {
  return <label className="flex flex-col gap-1.5"><span className="admin-label">{label}</span><input name={name} type={type} defaultValue={value} className="admin-input" /></label>;
}

