import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { TEMPLATES } from "@/data/templates";
import type { Category, SectionKey, TemplateTheme, WeddingTemplate } from "@/lib/types";

/**
 * Template source of truth.
 *
 * The public marketplace prefers templates stored in the database (managed in
 * Admin → Templates). If the table is empty or unreachable, it falls back to
 * the curated static collection so the storefront never renders blank.
 */

type TemplateRow = typeof templates.$inferSelect;

function rowToTemplate(row: TemplateRow): WeddingTemplate {
  const fallback = TEMPLATES.find((t) => t.slug === row.slug) ?? TEMPLATES[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? fallback.tagline,
    description: row.description ?? fallback.description,
    categories: (row.categories?.length ? row.categories : fallback.categories) as Category[],
    style: row.style?.length ? row.style : fallback.style,
    price: row.price,
    premium: row.premium,
    image: row.image || fallback.image,
    imageAlt: row.imageAlt || fallback.imageAlt,
    theme: (row.theme as TemplateTheme) ?? fallback.theme,
    features: row.features?.length ? row.features : fallback.features,
    sections: (row.sections?.length ? row.sections : fallback.sections) as SectionKey[],
    opening: (row.opening as WeddingTemplate["opening"]) ?? fallback.opening,
  };
}

export interface TemplateSource {
  templates: WeddingTemplate[];
  /** "database" when served from Supabase/Postgres, "static" when using the bundled collection. */
  origin: "database" | "static";
}

export async function getTemplates(): Promise<TemplateSource> {
  try {
    const rows = await db
      .select()
      .from(templates)
      .where(eq(templates.status, "published"))
      .orderBy(asc(templates.createdAt));

    if (rows.length === 0) return { templates: TEMPLATES, origin: "static" };
    return { templates: rows.map(rowToTemplate), origin: "database" };
  } catch {
    // Database unreachable — keep the storefront alive with the static set.
    return { templates: TEMPLATES, origin: "static" };
  }
}

export async function getTemplateList(): Promise<WeddingTemplate[]> {
  return (await getTemplates()).templates;
}

export async function findTemplate(slug: string): Promise<WeddingTemplate | undefined> {
  const { templates: list } = await getTemplates();
  return list.find((t) => t.slug === slug) ?? TEMPLATES.find((t) => t.slug === slug);
}
