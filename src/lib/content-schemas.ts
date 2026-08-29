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

export const serviceAreaSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  description: z.string().trim().max(500).default(""),
  areas: z.array(z.string().trim().max(100)).default([]),
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

export const servicesPageContentSchema = z.object({
  heading: z.string().trim().max(200).default(""),
  intro: z.string().trim().max(1000).default(""),
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

export const CONTENT_SCHEMA_BY_PAGE = {
  home: homeContentSchema,
  about: aboutContentSchema,
  services: servicesPageContentSchema,
  contact: contactPageContentSchema,
  team: teamPageContentSchema,
} as const;
