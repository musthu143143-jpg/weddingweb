import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import { BRAND } from "@/data/content";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://celebrates.studio"),
  title: {
    default: `${BRAND.name} — Premium Digital Wedding Invitations`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Turn your love story into an unforgettable digital experience. Discover 3D, cinematic, luxury and traditional wedding invitation templates, preview them live and make them yours.",
  keywords: [
    "wedding invitation",
    "digital wedding invitation",
    "3D wedding invitation",
    "luxury wedding invitation",
    "indian wedding invitation",
    "wedding website",
  ],
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name} — Your Love Story, Beautifully Invited`,
    description:
      "Create a wedding invitation that feels as unforgettable as the day itself. 3D, cinematic and luxury templates.",
    images: [{ url: "/images/hero-mandap.jpg", width: 1600, height: 1000, alt: "Royal wedding mandap glowing at night" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Your Love Story, Beautifully Invited`,
    description: "Premium digital wedding invitations. 3D, cinematic, luxury.",
    images: ["/images/hero-mandap.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND.name,
  slogan: "Your Love Story, Beautifully Invited.",
  url: "https://celebrates.studio",
  logo: "https://celebrates.studio/og.png",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable} ${sans.variable}`}>
      <body className="bg-ivory font-sans text-charcoal antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
