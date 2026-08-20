import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageHero } from "@/components/ui/core";
import { MarketplaceTeaser } from "@/components/sections/Marketplace";
import { getTemplateList } from "@/lib/templatesService";
import { FinalCta } from "@/components/sections/Social";

export const metadata: Metadata = {
  title: "Wedding Invitation Templates",
  description:
    "Browse 3D, luxury, floral, traditional, minimal, cinematic, Indian, Muslim, Hindu, Christian and destination wedding invitation templates.",
};

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getTemplateList();
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="The Collection"
          title="Wedding Invitation"
          script="Templates"
          sub="Every design is handcrafted, fully customisable and ready to carry your story. Filter by style or tradition to find yours."
        />
        <div className="bg-ivory py-20">
          <MarketplaceTeaser showHeading={false} templates={templates} />
        </div>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
