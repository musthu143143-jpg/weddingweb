/**
 * Core domain types for the Celebrates platform.
 * The template controls the DESIGN (theme, fonts, ornaments, sections).
 * The invitation data controls the CONTENT (couple, events, gallery…).
 * This separation keeps the platform configuration-driven and backend-ready.
 */

export type Category =
  | "3D"
  | "Luxury"
  | "Floral"
  | "Traditional"
  | "Minimal"
  | "Cinematic"
  | "Modern"
  | "Indian"
  | "Muslim"
  | "Hindu"
  | "Christian"
  | "Destination";

export type OrnamentStyle = "royal" | "line" | "floral" | "geo" | "modern" | "coastal";

/** Interactive 3D opening experience shown before the invitation. */
export type OpeningKind = "doors" | "tanjore" | "scratch" | "curtain" | "book" | "ring" | "seal" | "lantern" | "fireworks";

export interface TemplateTheme {
  /** Outer / page background */
  bg: string;
  /** Card / panel surface */
  panel: string;
  /** Primary text ink */
  ink: string;
  /** Secondary accent */
  accent: string;
  /** Metallic / gold accent */
  gold: string;
  /** Script name colour */
  script: string;
  /** Decorative ornament language */
  ornament: OrnamentStyle;
  /** Whether the theme is dark (affects overlays) */
  dark?: boolean;
}

export type SectionKey =
  | "story"
  | "events"
  | "gallery"
  | "venue"
  | "countdown"
  | "rsvp"
  | "music"
  | "family"
  | "travel"
  | "gifts";

export interface WeddingTemplate {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categories: Category[];
  style: string[];
  price: number;
  premium: boolean;
  image: string;
  imageAlt: string;
  theme: TemplateTheme;
  features: string[];
  sections: SectionKey[];
  /** Optional interactive 3D opening animation. */
  opening?: OpeningKind;
}

export interface WeddingEvent {
  name: string;
  date: string; // human readable
  time: string;
  venue: string;
  address: string;
  mapUrl: string;
  dressCode?: string;
  description?: string;
}

export interface StoryMoment {
  year: string;
  title: string;
  text: string;
  image?: string;
}

export interface InvitationData {
  couple: {
    bride: string;
    groom: string;
    monogram: string;
    familiesLine: string;
    inviteLine: string;
  };
  /** Optional portrait photos shown on the invitation hero. */
  photos?: { bride?: string; groom?: string };
  /** Per-section visibility. A missing/undefined key means the section is on. */
  sections?: Partial<Record<SectionKey, boolean>>;
  dateISO: string;
  dateLabel: string;
  events: WeddingEvent[];
  story: StoryMoment[];
  gallery: string[];
  family: { her: string[]; him: string[] };
  music: { title: string; artist: string; url?: string };
  /** Optional custom copy for the RSVP widget. */
  rsvp?: {
    enabled?: boolean;
    prompt?: string;
    acceptLabel?: string;
    declineLabel?: string;
    note?: string;
  };
  venue: { name: string; city: string; address: string; mapUrl: string };
  travel: string;
  gifts: string;
  finalMessage: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  blurb: string;
  features: string[];
  cta: string;
  popular?: boolean;
}
