import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND, DEMO_INVITATION } from "@/data/content";
import { getTemplate, TEMPLATES } from "@/data/templates";
import { findTemplate } from "@/lib/templatesService";
import { decodePreview, mergeInvitation } from "@/lib/previewToken";
import type { TemplateTheme } from "@/lib/types";
import InvitationDemo from "@/components/invitation/InvitationDemo";
import OpeningGate from "@/components/openings/OpeningGate";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return { title: "Invitation Preview" };
  return {
    title: `${t.name} — ${t.tagline}`,
    description: t.description,
    openGraph: { title: `${t.name} · ${BRAND.name} Invitation Preview`, images: [t.image] },
  };
}

export default async function TemplateDemoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const baseTemplate = (await findTemplate(slug)) ?? getTemplate(slug);
  if (!baseTemplate) notFound();

  // If the editor sent a preview token, use its draft + theme overrides so
  // this page reflects the caller's live edits — not the static demo content.
  const payload = decodePreview(preview);
  const template = payload?.theme
    ? { ...baseTemplate, theme: { ...baseTemplate.theme, ...(payload.theme as Partial<TemplateTheme>) } }
    : baseTemplate;
  const data = mergeInvitation(DEMO_INVITATION, payload?.data);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${template.name} Wedding Invitation`,
    description: template.description,
    image: `https://celebrates.studio${template.image}`,
    offers: {
      "@type": "Offer",
      price: template.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {template.opening ? (
        <OpeningGate template={template} data={data}>
          <InvitationDemo template={template} data={data} />
        </OpeningGate>
      ) : (
        <InvitationDemo template={template} data={data} />
      )}
    </>
  );
}
