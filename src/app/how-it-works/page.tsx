import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageHero } from "@/components/ui/core";
import { HowItWorks } from "@/components/sections/Features";
import { Experience3D } from "@/components/sections/Marketplace";
import { WhyDigital } from "@/components/sections/Intro";
import { FinalCta } from "@/components/sections/Social";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Choose a design, make it yours, preview everything and share your story — creating your wedding invitation takes four gentle steps.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Simple & Beautiful"
          title="From template to"
          script="treasured keepsake"
          sub="Creating your invitation should feel as joyful as the day itself. Here is exactly how it works."
        />
        <HowItWorks />
        <Experience3D />
        <WhyDigital />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
