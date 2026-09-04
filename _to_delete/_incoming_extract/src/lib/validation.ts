import { z } from "zod";
import { GALLERY_CATEGORIES } from "@/models/GalleryItem";
import { LEAD_STATUSES } from "@/models/Lead";

const objectIdString = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id")
  .optional()
  .or(z.literal(""));

/* ---------------------------- Public lead form --------------------------- */

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(30),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  address: z.string().trim().max(300).optional().default(""),
  serviceNeeded: z.string().trim().max(120).optional().default(""),
  preferredDate: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  imageMediaId: objectIdString,
  // Honeypot field: real users never fill this in (it's visually hidden).
  // Any non-empty value here means the submission is very likely spam/bot.
  company: z.string().max(200).optional().default(""),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  note: z.string().trim().min(1).max(2000).optional(),
});

/* -------------------------------- Services -------------------------------- */

export const serviceProcessStepSchema = z.object({
  title: z.string().trim().max(100).default(""),
  description: z.string().trim().max(400).default(""),
  icon: z.string().trim().max(60).default("ClipboardList"),
});

export const serviceFaqSchema = z.object({
  question: z.string().trim().max(200).default(""),
  answer: z.string().trim().max(1000).default(""),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().trim().max(5000).default(""),
  shortDescription: z.string().trim().max(300).default(""),
  imageMediaId: objectIdString,
  icon: z.string().trim().min(1).max(60).default("Sparkles"),
  // "Why choose us for this service" checklist bullets on the individual
  // service page. Optional — falls back to a generic checklist if empty.
  benefits: z.array(z.string().trim().max(200)).default([]),
  // Dedicated per-service process steps + FAQs shown on the individual
  // service page. Optional — the page falls back to the sitewide defaults
  // (home page process steps / services page FAQs) when a service hasn't
  // had its own set filled in yet.
  processSteps: z.array(serviceProcessStepSchema).default([]),
  faqs: z.array(serviceFaqSchema).default([]),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

/* ------------------------------ Service plans ------------------------------ */

export const servicePlanSchema = z.object({
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(300).default(""),
  frequency: z.string().trim().max(60).default(""),
  features: z.array(z.string().trim().max(200)).default([]),
  priceLabel: z.string().trim().max(60).default("Contact for Pricing"),
  imageMediaId: objectIdString,
  highlighted: z.boolean().default(false),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

/* --------------------------------- Projects -------------------------------- */

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens"),
  summary: z.string().trim().max(300).default(""),
  description: z.string().trim().max(5000).default(""),
  imageMediaId: objectIdString,
  beforeImageMediaId: objectIdString,
  afterImageMediaId: objectIdString,
  location: z.string().trim().max(120).default(""),
  serviceSlug: z.string().trim().max(150).default(""),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

/* ------------------------------ Team members ------------------------------ */

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(120).default(""),
  bio: z.string().trim().max(2000).default(""),
  photoMediaId: objectIdString,
  socialLinks: z
    .object({
      facebook: z.string().trim().max(300).optional().default(""),
      instagram: z.string().trim().max(300).optional().default(""),
      linkedin: z.string().trim().max(300).optional().default(""),
    })
    .default({ facebook: "", instagram: "", linkedin: "" }),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

/* -------------------------------- Gallery ---------------------------------- */

export const galleryItemSchema = z.object({
  title: z.string().trim().max(200).default(""),
  caption: z.string().trim().max(500).default(""),
  category: z.enum(GALLERY_CATEGORIES),
  imageMediaId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Image is required"),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

/* ------------------------------ Testimonials -------------------------------- */

export const testimonialSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  testimonialText: z.string().trim().min(2).max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  photoMediaId: objectIdString,
  location: z.string().trim().max(120).default(""),
  isPlaceholder: z.boolean().default(false),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

/* ------------------------------ Site settings ------------------------------- */

export const siteSettingsSchema = z.object({
  businessName: z.string().trim().min(1).max(200),
  logoMediaId: objectIdString,
  faviconMediaId: objectIdString,
  phone: z.string().trim().max(40).default(""),
  email: z.string().trim().max(200).default(""),
  address: z.string().trim().max(300).default(""),
  socialLinks: z
    .object({
      facebook: z.string().trim().max(300).optional().default(""),
      instagram: z.string().trim().max(300).optional().default(""),
      google: z.string().trim().max(300).optional().default(""),
      tiktok: z.string().trim().max(300).optional().default(""),
      youtube: z.string().trim().max(300).optional().default(""),
    })
    .default({ facebook: "", instagram: "", google: "", tiktok: "", youtube: "" }),
  primaryCtaText: z.string().trim().max(60).default("Get a Free Quote"),
  primaryCtaUrl: z.string().trim().max(300).default("/contact"),
  footerText: z.string().trim().max(1000).default(""),
  businessDescription: z.string().trim().max(2000).default(""),
  serviceAreas: z.array(z.string().trim().max(100)).default([]),
  googleReviewUrl: z.string().trim().max(300).default(""),
  googleReviewsBadgeText: z.string().trim().max(80).default(""),
  businessHours: z.string().trim().max(300).default(""),
  seoDefaults: z
    .object({
      title: z.string().trim().max(200).optional().default(""),
      description: z.string().trim().max(400).optional().default(""),
      ogImageMediaId: objectIdString,
    })
    .default({ title: "", description: "" }),
});

/* -------------------------------- Navigation -------------------------------- */

export const navigationSchema = z.object({
  items: z.array(
    z.object({
      label: z.string().trim().min(1).max(60),
      href: z.string().trim().min(1).max(300),
      order: z.number().int().default(0),
      visible: z.boolean().default(true),
      showInHeader: z.boolean().default(true),
    })
  ),
});

/* ----------------------------- Page SEO shared ------------------------------ */

export const seoSchema = z.object({
  title: z.string().trim().max(200).default(""),
  metaDescription: z.string().trim().max(400).default(""),
  ogTitle: z.string().trim().max(200).default(""),
  ogDescription: z.string().trim().max(400).default(""),
  ogImageMediaId: objectIdString,
  canonicalUrl: z.string().trim().max(300).default(""),
});

/* --------------------------------- Login ------------------------------------ */

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});
