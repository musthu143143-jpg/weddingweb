import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageHero, Ornament, Reveal, SectionHeading } from "@/components/ui/core";
import { FinalCta } from "@/components/sections/Social";
import { BRAND } from "@/data/content";

export const metadata: Metadata = {
  title: "About",
  description: `${BRAND.name} turns love stories into unforgettable digital experiences. Premium 3D, cinematic and luxury wedding invitations.`,
};

const VALUES = [
  { title: "Emotion First", text: "Technology should serve feeling. Every animation, font and colour is chosen to move the heart." },
  { title: "Crafted, Not Generated", text: "Each template is designed by hand — no recycled layouts, no generic marketplaces." },
  { title: "Every Tradition", text: "From Nikah to Nuptials, Mehndi to Mass — we design for the full spectrum of love." },
  { title: "Built to Last", text: "Your invitation is a keepsake. It stays beautiful, shareable and updateable forever." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Our Story"
          title="Made for moments that"
          script="last forever"
          sub={`${BRAND.name} exists because a wedding invitation should feel like the first chapter of your celebration — not a forwarded message.`}
        />

        <section className="bg-ivory py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
            <Reveal className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] border border-gold/30 shadow-lux">
                <Image src="/images/candles.jpg" alt="A candlelit wedding reception glowing with golden light" fill className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.15} className="flex flex-col items-start gap-6">
              <span className="font-sans text-[11px] uppercase tracking-luxe text-gold">Why we exist</span>
              <h2 className="font-display text-4xl leading-[1.1] font-medium text-charcoal sm:text-5xl">
                A wedding invitation is the <span className="font-script text-5xl text-burgundy">first memory</span> of your day.
              </h2>
              <p className="font-sans text-[15px] leading-relaxed font-light text-ink-soft/80">
                We watched beautiful love stories get announced through plain text forwards, and we
                knew couples deserved better. So we built a studio where design, motion and emotion
                meet — a place where your invitation becomes an experience your guests open, feel
                and remember.
              </p>
              <p className="font-sans text-[15px] leading-relaxed font-light text-ink-soft/70">
                Today, {BRAND.name} crafts premium digital invitations for every tradition and every
                kind of love — from intimate elopements to royal celebrations.
              </p>
              <Ornament style="royal" className="h-4 w-36 text-gold/60" />
            </Reveal>
          </div>
        </section>

        <section className="bg-cream/70 py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading eyebrow="What Guides Us" title="Our values" />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.08}>
                  <div className="flex h-full flex-col gap-4 rounded-2xl border border-gold/20 bg-white/70 p-8">
                    <span className="font-display text-3xl font-semibold text-gold">0{i + 1}</span>
                    <h3 className="font-display text-2xl font-semibold text-charcoal">{v.title}</h3>
                    <p className="font-sans text-[14px] leading-relaxed font-light text-ink-soft/75">{v.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="policies" className="bg-ivory py-24">
          <div className="mx-auto grid max-w-5xl gap-10 px-5 sm:px-8 md:grid-cols-2">
            <Reveal>
              <h3 className="font-display text-2xl font-semibold text-charcoal">Terms of Service</h3>
              <p className="mt-4 font-sans text-[14px] leading-relaxed font-light text-ink-soft/75">
                Templates and invitations are licensed for personal, non-commercial use by the
                purchasing couple. Published invitations remain your content; {BRAND.name} provides
                the design, hosting and tooling. Full terms arrive with customer accounts in the
                next release.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h3 className="font-display text-2xl font-semibold text-charcoal">Privacy</h3>
              <p className="mt-4 font-sans text-[14px] leading-relaxed font-light text-ink-soft/75">
                We collect only what is needed to create and share your invitation. Guest RSVP
                responses belong to you. We never sell personal data, and you may request deletion
                at any time. A complete privacy policy ships with the backend release.
              </p>
            </Reveal>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
