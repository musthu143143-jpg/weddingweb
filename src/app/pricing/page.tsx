import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageHero } from "@/components/ui/core";
import { PricingSection } from "@/components/sections/Social";
import { Testimonials } from "@/components/sections/Social";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Essential, Signature and Luxury plans for your digital wedding invitation. Transparent pricing, no hidden costs.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Pricing"
          title="Invest in a"
          script="beautiful beginning"
          sub="One-time pricing. No subscriptions. Every plan includes a shareable, gorgeous invitation."
        />
        <PricingSection />

        <section className="bg-cream/70 py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="rounded-[24px] border border-gold/25 bg-white/70 p-8 sm:p-10">
              <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">How ordering works today</p>
              <h2 className="mt-2 font-display text-3xl font-medium text-charcoal">Order now, pay offline, publish instantly</h2>
              <ol className="mt-6 space-y-4">
                {[
                  "Create your invitation and open My Invitations in your studio dashboard.",
                  "Tap “Unlock” on your invitation — pay the design’s price via UPI or bank transfer and confirm the payment.",
                  "Our team verifies the payment on WhatsApp and sends you a one-time secret unlock key.",
                  "Enter the key to unlock publishing, then share your live invitation link with every guest.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-burgundy font-display text-[15px] font-semibold text-ivory">{i + 1}</span>
                    <p className="font-sans text-[14px] font-light leading-relaxed text-ink-soft/80">{step}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 rounded-xl bg-gold-pale/40 px-5 py-4 font-sans text-[13px] font-light leading-relaxed text-ink-soft/70">
                Online card payments arrive in the next release. Until then, every key is issued personally by our team — usually within minutes on WhatsApp.
              </p>
            </div>
          </div>
        </section>

        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
