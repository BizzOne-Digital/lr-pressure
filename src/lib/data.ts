import "server-only";
import { connectToDatabase } from "./db";
import { SiteSettings, type ISiteSettings } from "@/models/SiteSettings";
import { Navigation, type INavigation } from "@/models/Navigation";
import { Service, type IService } from "@/models/Service";
import { TeamMember, type ITeamMember } from "@/models/TeamMember";
import { GalleryItem, type IGalleryItem } from "@/models/GalleryItem";
import { Testimonial, type ITestimonial } from "@/models/Testimonial";
import { Page, type IPage, type PageKey } from "@/models/Page";
import {
  CONTENT_SCHEMA_BY_PAGE,
  type HomeContent,
  type AboutContent,
  type ServicesPageContent,
  type ContactPageContent,
  type TeamPageContent,
} from "./content-schemas";

type PageContentMap = {
  home: HomeContent;
  about: AboutContent;
  services: ServicesPageContent;
  contact: ContactPageContent;
  team: TeamPageContent;
};

/**
 * Server-only data access for the public site. React Server Components call
 * these directly (no extra HTTP round trip through /api) — MongoDB is still
 * the single source of truth, this is just the fastest path to it. Every
 * function degrades gracefully to sensible defaults if a collection is
 * empty, so a freshly-seeded or partially-edited site never crashes.
 */

export async function getSiteSettings(): Promise<ISiteSettings> {
  await connectToDatabase();
  const settings = await SiteSettings.findOne().lean();
  if (settings) return settings as unknown as ISiteSettings;
  // Fallback default if settings haven't been seeded yet.
  return {
    businessName: "LR Pressure Washing",
    phone: "+1 267-980-4171",
    email: "lramirezphilly1@gmail.com",
    address: "",
    socialLinks: {},
    primaryCtaText: "Get a Free Quote",
    primaryCtaUrl: "/contact",
    footerText: "",
    businessDescription: "",
    seoDefaults: { title: "", description: "" },
  } as unknown as ISiteSettings;
}

export async function getNavigation(): Promise<INavigation["items"]> {
  await connectToDatabase();
  const nav = await Navigation.findOne().lean();
  if (nav && nav.items?.length) {
    return (nav.items as INavigation["items"])
      .filter((i) => i.visible)
      .sort((a, b) => a.order - b.order);
  }
  return [
    { label: "Home", href: "/", order: 0, visible: true },
    { label: "About", href: "/about", order: 1, visible: true },
    { label: "Services", href: "/services", order: 2, visible: true },
    { label: "Our Team", href: "/team", order: 3, visible: true },
    { label: "Contact", href: "/contact", order: 4, visible: true },
  ];
}

export async function getServices({
  onlyActive = true,
  onlyFeatured = false,
}: { onlyActive?: boolean; onlyFeatured?: boolean } = {}): Promise<IService[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (onlyActive) query.active = true;
  if (onlyFeatured) query.featured = true;
  const services = await Service.find(query).sort({ order: 1, createdAt: 1 }).lean();
  return services as unknown as IService[];
}

export async function getServiceBySlug(slug: string): Promise<IService | null> {
  await connectToDatabase();
  const service = await Service.findOne({ slug, active: true }).lean();
  return (service as unknown as IService) ?? null;
}

export async function getTeamMembers(): Promise<ITeamMember[]> {
  await connectToDatabase();
  const members = await TeamMember.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
  return members as unknown as ITeamMember[];
}

export async function getGalleryItems(category?: string): Promise<IGalleryItem[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = { active: true };
  if (category) query.category = category;
  const items = await GalleryItem.find(query).sort({ order: 1, createdAt: 1 }).lean();
  return items as unknown as IGalleryItem[];
}

export async function getTestimonials({
  onlyFeatured = false,
}: { onlyFeatured?: boolean } = {}): Promise<ITestimonial[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = { active: true };
  if (onlyFeatured) query.featured = true;
  const items = await Testimonial.find(query).sort({ order: 1, createdAt: 1 }).lean();
  return items as unknown as ITestimonial[];
}

export async function getPageContent<K extends PageKey>(
  key: K
): Promise<{ content: PageContentMap[K]; seo: IPage["seo"] }> {
  await connectToDatabase();
  const page = await Page.findOne({ pageKey: key }).lean();
  const schema = CONTENT_SCHEMA_BY_PAGE[key];
  const content = schema.parse(page?.content ?? {}) as PageContentMap[K];
  const seo = (page?.seo ?? {
    title: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
  }) as IPage["seo"];
  return { content, seo };
}
