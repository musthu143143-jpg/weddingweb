import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/hero/Hero";
import { EmotionalIntro, WhyDigital } from "@/components/sections/Intro";
import { Experience3D, FeaturedTemplate, MarketplaceTeaser } from "@/components/sections/Marketplace";
import { getTemplateList } from "@/lib/templatesService";
import { FeaturesGrid, HowItWorks } from "@/components/sections/Features";
import { EventsDemo, RsvpDemo, StoryDemo } from "@/components/sections/Wedding";
import { FinalCta, Inspiration, PricingSection, Testimonials } from "@/components/sections/Social";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const templates = await getTemplateList();
  return (
    <>
      <Navbar overlay />
      <main>
        <Hero />
        <EmotionalIntro />
        <MarketplaceTeaser templates={templates} />
        <FeaturedTemplate />
        <Experience3D />
        <FeaturesGrid />
        <StoryDemo />
        <EventsDemo />
        <RsvpDemo />
        <HowItWorks />
        <WhyDigital />
        <Testimonials />
        <Inspiration />
        <PricingSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
