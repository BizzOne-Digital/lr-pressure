import { z } from "zod";

/**
 * Shape + validation for the flexible `content` blob stored on each Page
 * document (see src/models/Page.ts). Keeping this in one place means the
 * seed script, the admin editor APIs, and the public page renderers all
 * agree on the same structure.
 */

const mediaId = z.string().trim().max(60).optional().default("");

export const heroSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  subheading: z.string().trim().max(500).default(""),
  heroImageMediaId: mediaId,
  ctaText: z.string().trim().max(60).default("Get a Free Quote"),
  ctaUrl: z.string().trim().max(300).default("/contact"),
  secondaryCtaText: z.string().trim().max(60).default("View Our Services"),
  secondaryCtaUrl: z.string().trim().max(300).default("/services"),
  trustBadges: z.array(z.string().trim().max(60)).default([]),
});

export const benefitSchema = z.object({
  title: z.string().trim().max(100).default(""),
  description: z.string().trim().max(400).default(""),
  icon: z.string().trim().max(60).default("ShieldCheck"),
  order: z.number().int().default(0),
});

export const processStepSchema = z.object({
  title: z.string().trim().max(100).default(""),
  description: z.string().trim().max(400).default(""),
  icon: z.string().trim().max(60).default("ClipboardList"),
  order: z.number().int().default(0),
});

export const whyChooseUsSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  content: z.string().trim().max(2000).default(""),
  imageMediaId: mediaId,
  points: z.array(z.string().trim().max(200)).default([]),
});

export const beforeAfterSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  description: z.string().trim().max(500).default(""),
});

// The list of towns/areas itself lives on SiteSettings.serviceAreas (shared
// with the footer) rather than here, so there's a single source of truth —
// this schema only holds the section's editable heading/description.
export const serviceAreaSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  description: z.string().trim().max(500).default(""),
});

export const ctaSectionSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  description: z.string().trim().max(500).default(""),
  buttonText: z.string().trim().max(60).default("Get a Free Quote"),
  buttonUrl: z.string().trim().max(300).default("/contact"),
  backgroundImageMediaId: mediaId,
});

export const homeContentSchema = z.object({
  hero: heroSchema.default(() => heroSchema.parse({})),
  benefits: z.array(benefitSchema).default([]),
  whyChooseUs: whyChooseUsSchema.default(() => whyChooseUsSchema.parse({})),
  process: z.array(processStepSchema).default([]),
  beforeAfter: beforeAfterSchema.default(() => beforeAfterSchema.parse({})),
  serviceArea: serviceAreaSchema.default(() => serviceAreaSchema.parse({})),
  cta: ctaSectionSchema.default(() => ctaSectionSchema.parse({})),
});

export type HomeContent = z.infer<typeof homeContentSchema>;

export const aboutValueSchema = z.object({
  title: z.string().trim().max(100).default(""),
  description: z.string().trim().max(400).default(""),
  icon: z.string().trim().max(60).default("CheckCircle2"),
});

export const aboutContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  missionStatement: z.string().trim().max(2000).default(""),
  content: z.string().trim().max(4000).default(""),
  imageMediaId: mediaId,
  values: z.array(aboutValueSchema).default([]),
});

export type AboutContent = z.infer<typeof aboutContentSchema>;

export const faqItemSchema = z.object({
  question: z.string().trim().max(200).default(""),
  answer: z.string().trim().max(1000).default(""),
});

const DEFAULT_SERVICE_FAQS = [
  {
    question: "What is soft washing, and is it different from pressure washing?",
    answer:
      "Soft washing uses lower water pressure combined with a cleaning solution to safely remove dirt, algae, and mildew from delicate surfaces like siding and roofing, while pressure washing uses higher water pressure alone and is better suited to tougher surfaces like concrete.",
  },
  {
    question: "How often should I get this service done?",
    answer:
      "It depends on your property, local climate, and how quickly buildup returns — many customers schedule a cleaning once or twice a year. We're happy to recommend a schedule for your specific property.",
  },
  {
    question: "Is this safe for my home's surfaces?",
    answer:
      "We adjust our technique, pressure, and cleaning solution to match the surface being cleaned so it's treated appropriately.",
  },
  {
    question: "Do you provide a quote before starting work?",
    answer:
      "Yes — contact us through our quote form or by phone, and we'll walk through your project and provide a free, no-obligation quote before any work begins.",
  },
  {
    question: "How do I schedule a service?",
    answer:
      "Reach out through our contact page or give us a call, and we'll find a time that works for your schedule.",
  },
] as const;

export const servicesPageContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  intro: z.string().trim().max(1000).default(""),
  faqs: z.array(faqItemSchema).default(() => DEFAULT_SERVICE_FAQS.map((f) => ({ ...f }))),
});

export type ServicesPageContent = z.infer<typeof servicesPageContentSchema>;

export const contactPageContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  intro: z.string().trim().max(1000).default(""),
  successMessage: z
    .string()
    .trim()
    .max(500)
    .default("Thank you! Your quote request has been received. We'll be in touch shortly."),
});

export type ContactPageContent = z.infer<typeof contactPageContentSchema>;

export const teamPageContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  intro: z.string().trim().max(1000).default(""),
});

export type TeamPageContent = z.infer<typeof teamPageContentSchema>;

export const servicePlansPageContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  intro: z.string().trim().max(1000).default(""),
});

export type ServicePlansPageContent = z.infer<typeof servicePlansPageContentSchema>;

export const reviewsPageContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  intro: z.string().trim().max(1000).default(""),
});

export type ReviewsPageContent = z.infer<typeof reviewsPageContentSchema>;

export const galleryPageContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  intro: z.string().trim().max(1000).default(""),
});

export type GalleryPageContent = z.infer<typeof galleryPageContentSchema>;

export const projectsPageContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  intro: z.string().trim().max(1000).default(""),
});

export type ProjectsPageContent = z.infer<typeof projectsPageContentSchema>;

export const CONTENT_SCHEMA_BY_PAGE = {
  home: homeContentSchema,
  about: aboutContentSchema,
  services: servicesPageContentSchema,
  contact: contactPageContentSchema,
  team: teamPageContentSchema,
  "service-plans": servicePlansPageContentSchema,
  reviews: reviewsPageContentSchema,
  gallery: galleryPageContentSchema,
  projects: projectsPageContentSchema,
} as const;
