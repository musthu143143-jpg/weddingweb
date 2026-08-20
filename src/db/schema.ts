import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

/**
 * Reserved schema for the backend phase (payments, customer dashboard,
 * invitation editor, publishing engine, Supabase auth).
 *
 * The current frontend phase reads from configuration-driven data in
 * src/data/* so the product can ship before the backend exists.
 * These tables document the intended persistence model.
 */

/**
 * Identity lives in Supabase Auth. This app database stores the role and
 * business profile for each authenticated Supabase user, keyed by their
 * Supabase auth user id (a UUID string).
 */
export const userRoleEnum = pgEnum("user_role", ["user", "reseller", "admin"]);

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // Supabase auth user id
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: userRoleEnum("role").notNull().default("user"),
  businessName: text("business_name"),
  phone: text("phone"),
  logoUrl: text("logo_url"), // Supabase Storage public URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  categories: jsonb("categories").$type<string[]>().notNull().default([]),
  style: jsonb("style").$type<string[]>().notNull().default([]),
  price: integer("price").notNull(),
  premium: boolean("premium").notNull().default(false),
  image: text("image"),
  imageAlt: text("image_alt"),
  theme: jsonb("theme").notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  sections: jsonb("sections").$type<string[]>().notNull().default([]),
  opening: text("opening"),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: text("customer_id"),
  resellerId: text("reseller_id"),
  customerEmail: text("customer_email").notNull(),
  templateSlug: text("template_slug"),
  plan: text("plan").notNull().default("Signature"),
  amount: integer("amount").notNull().default(0),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Single-use discount coupons.
 * - `code` is unique (database-enforced), stored uppercase.
 * - Each coupon may be redeemed exactly once: redemption sets `redeemedAt`.
 * - Validity window is controlled by `startsAt` and `expiresAt`.
 */
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull().default("percent"), // "percent" | "amount"
  discountValue: integer("discount_value").notNull().default(0),
  active: boolean("active").notNull().default(true),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  redeemedAt: timestamp("redeemed_at"),
  redeemedBy: text("redeemed_by"),
  redeemedOrderId: uuid("redeemed_order_id"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id"), // Supabase auth user id of the couple
  title: text("title").notNull().default("Our Wedding"),
  templateSlug: text("template_slug").notNull(),
  /** Full editor draft (couple, events, story, gallery, rsvp, music…). */
  data: jsonb("data"),
  /** Theme overrides chosen in the editor. */
  theme: jsonb("theme"),
  couple: jsonb("couple"),
  events: jsonb("events"),
  story: jsonb("story"),
  gallery: jsonb("gallery").$type<string[]>(),
  published: boolean("published").notNull().default(false),
  /** Plan unlocked via a secret key after offline payment confirmation. */
  unlockedPlan: text("unlocked_plan"),
  /** Public share slug used for the guest-facing link. */
  publicSlug: text("public_slug").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * One-time secret keys the admin hands to customers after confirming an
 * offline payment (UPI / bank transfer). Redeeming a key against an
 * invitation unlocks publishing and records a paid order.
 */
export const unlockKeys = pgTable("unlock_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  /** Legacy plan label; unlocks are now price/template based. */
  plan: text("plan").notNull().default("custom"),
  /** When set, the key only unlocks invitations using this template. */
  templateSlug: text("template_slug"),
  /** Price the key pays for; must match the template price on redemption. */
  amount: integer("amount").notNull().default(0),
  status: text("status").notNull().default("available"), // available | used | revoked
  usedBy: text("used_by"),
  usedInvitationId: uuid("used_invitation_id"),
  usedAt: timestamp("used_at"),
  note: text("note"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rsvps = pgTable("rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  invitationId: uuid("invitation_id").notNull(),
  guestName: text("guest_name"),
  guestEmail: text("guest_email"),
  attending: boolean("attending").notNull(),
  guests: integer("guests").notNull().default(1),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
