import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageHero } from "@/components/ui/core";
import { MarketplaceTeaser } from "@/components/sections/Marketplace";
import { getTemplateList } from "@/lib/templatesService";
import { FinalCta } from "@/components/sections/Social";
import { CATEGORIES } from "@/data/content";
import type { Category } from "@/lib/types";

function deslug(s: string) {
  return s.replace(/-/g, " ");
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.toLowerCase().replace(/\s+/g, "-") }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const match = CATEGORIES.find((c) => c.toLowerCase().replace(/\s+/g, "-") === category);
  return { title: match ? `${match} Wedding Invitations` : "Invitation Category" };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const match = CATEGORIES.find((c) => c.toLowerCase().replace(/\s+/g, "-") === category) as Category | undefined;
  if (!match) notFound();

  const templates = await getTemplateList();

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Collection"
          title={`${match} Invitations`}
          sub={`Discover designs crafted for ${match.toLowerCase()} celebrations — each one ready to become uniquely yours.`}
        />
        <div className="bg-ivory py-20">
          <MarketplaceTeaser showHeading={false} initialCategory={match} templates={templates} />
        </div>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
