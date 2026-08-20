"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import {
  createAdminTemplate,
  createOrder,
  csv,
  deleteAdminTemplate,
  deleteOrder,
  parseTheme,
  seedStaticTemplates,
  updateAdminTemplate,
  updateOrderStatus,
} from "@/lib/adminData";
import { createUnlockKeys, revokeUnlockKey } from "@/lib/orders";
import { updateRole, type UserRole } from "@/lib/profile";
import { TEMPLATES } from "@/data/templates";

const VALID_ROLES: UserRole[] = ["user", "reseller", "admin"];
const VALID_ORDER_STATUSES = ["pending", "paid", "fulfilled", "cancelled"];
const VALID_TEMPLATE_STATUSES = ["draft", "published", "archived"];

function bool(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function revalidateAdmin() {
  ["/admin", "/admin/customers", "/admin/templates", "/admin/orders", "/admin/analytics"].forEach((path) => revalidatePath(path));
}

export async function changeUserRole(formData: FormData) {
  const ctx = await requireAdmin();

  const targetId = text(formData.get("userId"));
  const nextRole = text(formData.get("role")) as UserRole;

  if (!targetId || !VALID_ROLES.includes(nextRole)) throw new Error("Invalid role change request.");
  if (targetId === ctx.userId) throw new Error("You cannot change your own role.");

  await updateRole(targetId, nextRole);
  revalidateAdmin();
}

export async function seedTemplatesAction() {
  await requireAdmin();
  await seedStaticTemplates();
  revalidateAdmin();
  redirect("/admin/templates");
}

export async function createTemplateAction(formData: FormData) {
  await requireAdmin();
  const fallback = TEMPLATES[0].theme;
  const status = text(formData.get("status")) || "draft";
  if (!VALID_TEMPLATE_STATUSES.includes(status)) throw new Error("Invalid template status.");

  await createAdminTemplate({
    slug: text(formData.get("slug")),
    name: text(formData.get("name")),
    tagline: text(formData.get("tagline")),
    description: text(formData.get("description")),
    categories: csv(formData.get("categories")),
    style: csv(formData.get("style")),
    price: Number(formData.get("price") ?? 0),
    premium: bool(formData.get("premium")),
    image: text(formData.get("image")),
    imageAlt: text(formData.get("imageAlt")),
    theme: parseTheme(formData.get("theme"), fallback),
    features: csv(formData.get("features")),
    sections: csv(formData.get("sections")),
    status,
  });
  revalidateAdmin();
  redirect("/admin/templates");
}

export async function updateTemplateAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  const fallback = TEMPLATES[0].theme;
  const status = text(formData.get("status")) || "draft";
  if (!id) throw new Error("Template id missing.");
  if (!VALID_TEMPLATE_STATUSES.includes(status)) throw new Error("Invalid template status.");

  await updateAdminTemplate(id, {
    slug: text(formData.get("slug")),
    name: text(formData.get("name")),
    tagline: text(formData.get("tagline")),
    description: text(formData.get("description")),
    categories: csv(formData.get("categories")),
    style: csv(formData.get("style")),
    price: Number(formData.get("price") ?? 0),
    premium: bool(formData.get("premium")),
    image: text(formData.get("image")),
    imageAlt: text(formData.get("imageAlt")),
    theme: parseTheme(formData.get("theme"), fallback),
    features: csv(formData.get("features")),
    sections: csv(formData.get("sections")),
    status,
  });
  revalidateAdmin();
  redirect("/admin/templates");
}

export async function deleteTemplateAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) throw new Error("Template id missing.");
  await deleteAdminTemplate(id);
  revalidateAdmin();
}

export async function createOrderAction(formData: FormData) {
  await requireAdmin();
  const status = text(formData.get("status")) || "pending";
  if (!VALID_ORDER_STATUSES.includes(status)) throw new Error("Invalid order status.");

  await createOrder({
    customerEmail: text(formData.get("customerEmail")),
    customerId: text(formData.get("customerId")) || null,
    resellerId: text(formData.get("resellerId")) || null,
    templateSlug: text(formData.get("templateSlug")) || null,
    plan: text(formData.get("plan")) || "Signature",
    amount: Number(formData.get("amount") ?? 0),
    status,
    notes: text(formData.get("notes")) || null,
  });
  revalidateAdmin();
  redirect("/admin/orders");
}

export async function changeOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  const status = text(formData.get("status"));
  if (!id || !VALID_ORDER_STATUSES.includes(status)) throw new Error("Invalid order update.");
  await updateOrderStatus(id, status);
  revalidateAdmin();
}

export async function deleteOrderAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) throw new Error("Order id missing.");
  await deleteOrder(id);
  revalidateAdmin();
}

/* ------------------------------- unlock keys ------------------------------ */

export async function generateKeysAction(formData: FormData) {
  const ctx = await requireAdmin();
  const templateSlug = text(formData.get("templateSlug"));
  const count = Number(formData.get("count") ?? 1);
  const note = text(formData.get("note")) || null;

  let amount = 0;
  let slug: string | null = null;
  if (templateSlug === "__custom__") {
    amount = Number(formData.get("amount") ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount.");
  } else {
    const template = TEMPLATES.find((t) => t.slug === templateSlug);
    if (!template) throw new Error("Choose a design.");
    slug = template.slug;
    amount = template.price;
  }

  await createUnlockKeys({
    templateSlug: slug,
    amount: Math.round(amount),
    count: Number.isFinite(count) ? count : 1,
    createdBy: ctx.userId,
    note,
  });
  revalidateAdmin();
}

export async function revokeKeyAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) throw new Error("Key id missing.");
  await revokeUnlockKey(id);
  revalidateAdmin();
}
