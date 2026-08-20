import type { Category, InvitationData, PricingTier, StoryMoment } from "@/lib/types";

/**
 * Brand configuration — change the product name in one place.
 */
export const BRAND = {
  name: "Celebrates",
  monogram: "CE",
  tagline: "Made for moments that last forever.",
  email: "hello@celebrates.studio",
};

/**
 * Offline payment details shown to customers when they order a plan.
 * Until a payment gateway is connected, customers pay via UPI / bank
 * transfer, confirm, and redeem an unlock key issued by an admin.
 */
export const PAYMENT_INFO = {
  upiId: "celebrates@upi",
  upiName: "Celebrates Studio",
  bankName: "HDFC Bank",
  accountName: "Celebrates Studio",
  accountNumber: "5020 0012 3456 78",
  ifsc: "HDFC0001234",
  note: "After paying, message your payment reference to our WhatsApp and an administrator will send your secret unlock key.",
  whatsapp: "+91 90000 00000",
};

export const CATEGORIES: Category[] = [
  "3D",
  "Luxury",
  "Floral",
  "Traditional",
  "Minimal",
  "Cinematic",
  "Modern",
  "Indian",
  "Muslim",
  "Hindu",
  "Christian",
  "Destination",
];

export const NAV_LINKS = [
  { label: "Templates", href: "/templates" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Inspiration", href: "/inspiration" },
  { label: "Pricing", href: "/pricing" },
];

export const FEATURES: { icon: string; title: string; text: string }[] = [
  { icon: "heart", title: "Our Story", text: "Share how your journey began, in your own words." },
  { icon: "calendar", title: "Wedding Events", text: "Show every celebration, ceremony and ritual." },
  { icon: "map-pin", title: "Location", text: "Give guests one-tap directions to every venue." },
  { icon: "hourglass", title: "Countdown", text: "Build gentle excitement for the big day." },
  { icon: "image", title: "Photo Gallery", text: "Share your favourite memories together." },
  { icon: "mail", title: "RSVP", text: "Know exactly who is celebrating with you." },
  { icon: "music", title: "Music", text: "Set the mood with the song that is yours." },
  { icon: "users", title: "Family", text: "Introduce the people who complete your story." },
  { icon: "plane", title: "Travel & Stay", text: "Help guests plan their journey with ease." },
  { icon: "gift", title: "Gift Information", text: "Share gifting details beautifully and graciously." },
];

export const HOW_IT_WORKS = [
  { step: "01", title: "Choose Your Design", text: "Explore our collection of handcrafted wedding invitations and find the one that feels like you." },
  { step: "02", title: "Make It Yours", text: "Add your names, photos, story, events and every detail that makes your day yours." },
  { step: "03", title: "Preview Everything", text: "Experience your invitation exactly as your guests will, before you publish it." },
  { step: "04", title: "Share Your Story", text: "Send your invitation to family and friends through a single beautiful link." },
];

export const WHY_DIGITAL = [
  { icon: "sparkles", title: "Beautiful Anywhere", text: "Your invitation lives perfectly on every phone, tablet and desktop." },
  { icon: "share", title: "Easy to Share", text: "Send it through WhatsApp, Instagram, Messenger or email in one tap." },
  { icon: "refresh", title: "Always Updated", text: "Change event details anytime — without reprinting a single card." },
  { icon: "wand", title: "Interactive", text: "Maps, RSVP, countdowns, galleries, music and more, built in." },
  { icon: "heart", title: "Memorable", text: "Create an experience your guests will remember long after the day." },
];

export const TESTIMONIALS = [
  { quote: "It felt like opening our wedding invitation all over again.", names: "Aarav & Meera", note: "Sample preview" },
  { quote: "Our grandparents opened it on WhatsApp and called us in tears. That is everything.", names: "Rohan & Sana", note: "Sample preview" },
  { quote: "Elegant, effortless and unbelievably beautiful. Guests still talk about it.", names: "Daniel & Grace", note: "Sample preview" },
  { quote: "The 3D opening made our invitation feel like a keepsake, not a message.", names: "Arjun & Divya", note: "Sample preview" },
];

export const PRICING: PricingTier[] = [
  {
    id: "essential",
    name: "Essential",
    price: 799,
    blurb: "A beautiful beginning.",
    features: ["Premium template", "Custom names", "Wedding details", "Event information", "Map link", "Shareable invitation"],
    cta: "Choose Essential",
  },
  {
    id: "signature",
    name: "Signature",
    price: 1999,
    blurb: "The complete love story.",
    features: ["Premium animated template", "Photo gallery", "Music", "Countdown", "RSVP", "Maps", "Love story", "Custom event sections"],
    cta: "Choose Signature",
    popular: true,
  },
  {
    id: "luxury",
    name: "Luxury",
    price: 3999,
    blurb: "An unforgettable experience.",
    features: ["Premium 3D experience", "Advanced animations", "Unlimited sections", "RSVP", "Gallery", "Music", "Story timeline", "Travel information", "Custom branding", "Priority support"],
    cta: "Create Luxury Invitation",
  },
];

export const INSPIRATION: { title: string; blurb: string; image: string; templateSlug: string }[] = [
  { title: "Romantic Garden Wedding", blurb: "Soft light, living florals and timeless vows.", image: "/images/garden.jpg", templateSlug: "royal-garden" },
  { title: "Traditional South Indian Wedding", blurb: "Heritage, ritual and golden temple light.", image: "/images/hero-mandap.jpg", templateSlug: "mehfil" },
  { title: "Modern Minimal Wedding", blurb: "Quiet luxury and editorial restraint.", image: "/images/marble.jpg", templateSlug: "eternal" },
  { title: "Royal Palace Wedding", blurb: "Grandeur, chandeliers and regal romance.", image: "/images/emerald-arch.jpg", templateSlug: "noor" },
  { title: "Beach Wedding", blurb: "Barefoot vows where the sky meets the sea.", image: "/images/ocean.jpg", templateSlug: "ocean-promise" },
  { title: "Destination Wedding", blurb: "A journey your guests will never forget.", image: "/images/editorial.jpg", templateSlug: "forever" },
];

const STORY: StoryMoment[] = [
  { year: "2019", title: "The First Hello", text: "A shared umbrella, a missed bus, and a conversation that refused to end.", image: "https://images.pexels.com/photos/32060414/pexels-photo-32060414.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { year: "2020", title: "The First Adventure", text: "Two backpacks, one map, and a thousand small reasons to fall in love.", image: "https://images.pexels.com/photos/32857931/pexels-photo-32857931.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { year: "2022", title: "The Question", text: "Under a sky full of lanterns, one knee bent and two hearts agreed.", image: "https://images.pexels.com/photos/38781228/pexels-photo-38781228.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { year: "2026", title: "Forever Begins", text: "And now, surrounded by everyone we love, we begin our always.", image: "https://images.pexels.com/photos/15908065/pexels-photo-15908065.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
];

export const GALLERY_IMAGES = [
  "https://images.pexels.com/photos/32857931/pexels-photo-32857931.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/32060414/pexels-photo-32060414.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/38781228/pexels-photo-38781228.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/13044864/pexels-photo-13044864.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/28210866/pexels-photo-28210866.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/15908065/pexels-photo-15908065.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
];

/**
 * Demonstration invitation content used across previews and demos.
 * In the backend phase this becomes per-customer data.
 */
export const DEMO_INVITATION: InvitationData = {
  couple: {
    bride: "Meera",
    groom: "Aarav",
    monogram: "A & M",
    familiesLine: "Together with their families",
    inviteLine: "invite you to celebrate the beginning of their forever",
  },
  dateISO: "2026-12-14T10:00:00+05:30",
  dateLabel: "Monday, 14 December 2026",
  events: [
    {
      name: "Mehndi",
      date: "12 December 2026",
      time: "6:00 PM",
      venue: "Royal Garden",
      address: "14 Lake View Road, Chennai, Tamil Nadu",
      mapUrl: "https://maps.google.com/?q=Chennai,Tamil+Na+du",
      dressCode: "Florals & pastels",
      description: "An evening of henna, music and laughter beneath the marigolds.",
    },
    {
      name: "Wedding Ceremony",
      date: "14 December 2026",
      time: "10:00 AM",
      venue: "Grand Palace",
      address: "1 Palace Road, Chennai, Tamil Nadu",
      mapUrl: "https://maps.google.com/?q=Chennai,Tamil+Nadu",
      dressCode: "Traditional elegance",
      description: "The moment two families become one.",
    },
    {
      name: "Reception",
      date: "14 December 2026",
      time: "7:00 PM",
      venue: "Grand Palace",
      address: "1 Palace Road, Chennai, Tamil Nadu",
      mapUrl: "https://maps.google.com/?q=Chennai,Tamil+Nadu",
      dressCode: "Formal & festive",
      description: "Dinner, dancing and a night to remember.",
    },
  ],
  story: STORY,
  gallery: GALLERY_IMAGES,
  family: {
    her: ["Smt. Lakshmi Iyer", "Sri. Raghavan Iyer", "Ananya Iyer · Sister"],
    him: ["Smt. Priya Sharma", "Sri. Vikram Sharma", "Rohan Sharma · Brother"],
  },
  music: { title: "Tum Hi Ho", artist: "Instrumental · Mithoon" },
  venue: {
    name: "Grand Palace",
    city: "Chennai, Tamil Nadu",
    address: "1 Palace Road, Chennai, Tamil Nadu 600001",
    mapUrl: "https://maps.google.com/?q=Chennai,Tamil+Nadu",
  },
  travel: "A curated list of stays near the venue — from heritage suites to garden villas — will be shared with your confirmation. Airport transfers are arranged for out-of-town family.",
  gifts: "Your presence is the only gift we wish for. Should you wish to bless us further, a gift registry and blessings envelope will be available at the venue.",
  finalMessage: "We cannot wait to celebrate with you.",
};
