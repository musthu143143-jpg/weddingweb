import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageHero } from "@/components/ui/core";
import { Inspiration } from "@/components/sections/Social";
import { FeaturedTemplate } from "@/components/sections/Marketplace";
import { StoryDemo } from "@/components/sections/Wedding";

export const metadata: Metadata = {
  title: "Wedding Inspiration",
  description: "Romantic garden, traditional South Indian, modern minimal, royal palace, beach and destination wedding inspiration — with live template demos.",
};

export default function InspirationPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Inspiration"
          title="Wedding"
          script="Stories"
          sub="Six worlds of romance. Step inside each one and preview the invitation that tells its story."
        />
        <Inspiration full />
        <StoryDemo />
        <FeaturedTemplate />
      </main>
      <Footer />
    </>
  );
}
