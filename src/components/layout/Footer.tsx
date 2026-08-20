import Link from "next/link";
import type { SVGProps } from "react";
import { BRAND } from "@/data/content";
import { Monogram, Ornament } from "@/components/ui/core";

const Instagram = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
const Pinterest = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M12 3a9 9 0 0 0-3.4 17.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3-2.3 3-5 0-2.1-1.4-3.6-3.9-3.6a4.4 4.4 0 0 0-4.6 4.4c0 .9.3 1.5.7 2 .2.2.2.3.1.6l-.2.9c-.1.3-.3.4-.6.3-1.2-.5-1.8-1.9-1.8-3.4 0-2.5 2.1-5.5 6.3-5.5 3.4 0 5.6 2.4 5.6 5.1 0 3.5-1.9 6.1-4.8 6.1-1 0-1.9-.5-2.2-1.1l-.6 2.4c-.2.8-.7 1.7-1.1 2.3A9 9 0 1 0 12 3Z" />
  </svg>
);
const Facebook = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3h-2.6C11.5 3 10.5 4.4 10.5 7v1.5H8.5V12h2v9H14v-9h2.5l.5-3.5H14Z" />
  </svg>
);

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Templates", href: "/templates" },
      { label: "3D Invitations", href: "/categories/3d" },
      { label: "Luxury Invitations", href: "/categories/luxury" },
      { label: "Wedding Inspiration", href: "/inspiration" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Reseller Portal", href: "/reseller/login" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "FAQ", href: "/pricing#faq" },
      { label: "Terms", href: "/about#policies" },
      { label: "Privacy", href: "/about#policies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-burgundy-deep text-ivory">
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
          <div className="flex flex-col items-start gap-5">
            <span className="flex items-center gap-3">
              <Monogram text={BRAND.monogram} className="h-12 w-12 text-[16px] text-gold-soft" />
              <span className="font-display text-3xl font-semibold">{BRAND.name}</span>
            </span>
            <p className="max-w-xs font-sans text-[14px] leading-relaxed font-light text-ivory/65">
              Premium digital wedding invitations that turn your love story into an unforgettable experience.
            </p>
            <Ornament style="royal" className="h-4 w-40 text-gold-soft/50" />
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft">{col.title}</h3>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="font-sans text-[14px] font-light text-ivory/70 transition-colors duration-300 hover:text-gold-soft">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft">Social</h3>
            <div className="mt-5 flex flex-col gap-3.5">
              {[
                { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
                { label: "Pinterest", href: "https://pinterest.com", Icon: Pinterest },
                { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
              ].map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-3 font-sans text-[14px] font-light text-ivory/70 transition-colors duration-300 hover:text-gold-soft">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/20 transition-colors duration-300 group-hover:border-gold-soft/60">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </span>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-6 border-t border-ivory/10 pt-10 text-center">
          <p className="font-script text-3xl text-gold-soft">{BRAND.tagline}</p>
          <p className="font-sans text-[12px] font-light tracking-wide-2 text-ivory/45">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved. Crafted with love for every love story.
          </p>
        </div>
      </div>
    </footer>
  );
}
