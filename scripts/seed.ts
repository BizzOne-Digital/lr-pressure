/**
 * Idempotent seed script for initial website content.
 *
 * Safe to run multiple times: singleton documents (settings, navigation,
 * pages) are upserted, and collections (services, team, gallery,
 * testimonials) are only seeded if they're currently empty, so re-running
 * this will never duplicate content or clobber the admin's edits.
 *
 * Usage:
 *   npm run seed
 */
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env if present

import { Admin } from "../src/models/Admin";
import { Media } from "../src/models/Media";
import { SiteSettings } from "../src/models/SiteSettings";
import { Navigation } from "../src/models/Navigation";
import { Service } from "../src/models/Service";
import { TeamMember } from "../src/models/TeamMember";
import { GalleryItem } from "../src/models/GalleryItem";
import { Testimonial } from "../src/models/Testimonial";
import { Page } from "../src/models/Page";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "lramirezphilly1@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const SEED_ASSETS_DIR = path.join(__dirname, "..", "seed-assets");

// Returns the Media DOCUMENT's `_id` — this is the id every `imageMediaId` /
// `photoMediaId` field across the app stores and that /api/media/[id] and
// mediaUrl() expect, NOT the underlying GridFS file id (a separate ObjectId
// kept on the Media document as `gridfsId`).
async function uploadLocalImage(filename: string, alt: string): Promise<mongoose.Types.ObjectId> {
  const existing = await Media.findOne({ filename });
  if (existing) return existing._id;

  const filePath = path.join(SEED_ASSETS_DIR, filename);
  const buffer = fs.readFileSync(filePath);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection");
  const bucket = new GridFSBucket(db, { bucketName: "media" });

  const gridfsId = await new Promise<mongoose.Types.ObjectId>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType: "image/jpeg" },
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id as mongoose.Types.ObjectId));
    uploadStream.end(buffer);
  });

  const media = await Media.create({
    gridfsId,
    filename,
    mimeType: "image/jpeg",
    size: buffer.length,
    alt,
    uploadedBy: "seed-script",
  });

  return media._id;
}

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // ---------------------------------------------------------------- Admin --
  const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!existingAdmin) {
    const password = ADMIN_PASSWORD || generateRandomPassword();
    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({ email: ADMIN_EMAIL.toLowerCase(), passwordHash, name: "Luis" });
    console.log("\n=== ADMIN ACCOUNT CREATED ===");
    console.log(`Email:    ${ADMIN_EMAIL}`);
    if (!ADMIN_PASSWORD) {
      console.log(`Password: ${password}  (save this now — it will not be shown again)`);
    } else {
      console.log("Password: (set from ADMIN_PASSWORD env var)");
    }
    console.log("==============================\n");
  } else {
    console.log(`Admin account already exists for ${ADMIN_EMAIL}, skipping.`);
  }

  // ------------------------------------------------------------ Media --
  const heroModernHome = await uploadLocalImage("hero-modern-home.jpg", "Modern home exterior");
  const heroHouseWash = await uploadLocalImage("hero-house-wash.jpg", "Pressure washing a house exterior");
  const serviceRoof = await uploadLocalImage("service-roof-2.jpg", "Low pressure roof washing");
  const roofBeforeAfter = await uploadLocalImage("roof-before-after.jpg", "Roof cleaning before and after comparison");
  const driveway = await uploadLocalImage("driveway-action.jpg", "Power washing a driveway");
  const serviceConcrete = await uploadLocalImage("service-concrete.jpg", "Concrete surface cleaning");
  const concreteAction = await uploadLocalImage("concrete-action.jpg", "High pressure concrete cleaning");
  const serviceWindow = await uploadLocalImage("service-window.jpg", "Window cleaning close up");

  // ------------------------------------------------------------ Settings --
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({
      businessName: "LR Pressure Washing",
      phone: "+1 267-980-4171",
      email: "lramirezphilly1@gmail.com",
      address: "",
      socialLinks: {},
      primaryCtaText: "Get a Free Quote",
      primaryCtaUrl: "/contact",
      footerText:
        "Reliable, affordable, and professional pressure washing and exterior care — built to exceed expectations on every project.",
      businessDescription:
        "Our mission is to provide reliable, affordable, and professional pressure washing and exterior care services that consistently exceed customer expectations. We strive to build long-term relationships with our clients by delivering exceptional service, transparent pricing, and outstanding results on every project — no matter the size.",
      seoDefaults: {
        title: "LR Pressure Washing | Professional Exterior Cleaning",
        description:
          "Professional pressure washing for houses, driveways, roofs, and windows. Reliable, affordable, and built to exceed expectations. Get a free quote today.",
      },
    });
    console.log("Seeded site settings.");
  } else {
    console.log("Site settings already exist, skipping.");
  }

  // ----------------------------------------------------------- Navigation --
  const existingNav = await Navigation.findOne();
  if (!existingNav) {
    await Navigation.create({
      items: [
        { label: "Home", href: "/", order: 0, visible: true },
        { label: "About", href: "/about", order: 1, visible: true },
        { label: "Services", href: "/services", order: 2, visible: true },
        { label: "Our Team", href: "/team", order: 3, visible: true },
        { label: "Contact", href: "/contact", order: 4, visible: true },
      ],
    });
    console.log("Seeded navigation.");
  } else {
    console.log("Navigation already exists, skipping.");
  }

  // ------------------------------------------------------------- Services --
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany([
      {
        name: "House Washing",
        slug: "house-washing",
        shortDescription: "Soft-wash exterior cleaning that lifts dirt, mildew, and grime.",
        description:
          "Our house washing service uses a careful soft-wash technique to safely remove dirt, algae, and mildew from your siding without damaging your home's exterior. The result is a noticeably brighter, cleaner-looking property.",
        imageMediaId: heroHouseWash,
        icon: "Home",
        featured: true,
        order: 0,
        active: true,
      },
      {
        name: "Driveway Cleaning",
        slug: "driveway-cleaning",
        shortDescription: "Restore your driveway's original look by lifting stains and buildup.",
        description:
          "Oil stains, tire marks, and years of buildup can leave a driveway looking tired. Our pressure washing process restores concrete and asphalt driveways to a clean, like-new appearance.",
        imageMediaId: driveway,
        icon: "Car",
        featured: true,
        order: 1,
        active: true,
      },
      {
        name: "Window Cleaning",
        slug: "window-cleaning",
        shortDescription: "Streak-free exterior window cleaning for a brighter home.",
        description:
          "Clean windows make a real difference in how your property looks and feels. We carefully clean exterior window surfaces and frames, removing dirt and grime for a clear, streak-free finish.",
        imageMediaId: serviceWindow,
        icon: "AppWindow",
        featured: true,
        order: 2,
        active: true,
      },
      {
        name: "Roof Cleaning",
        slug: "roof-cleaning",
        shortDescription: "Low-pressure roof washing that safely removes stains and streaks.",
        description:
          "Dark streaks and stains on a roof are often caused by algae and organic buildup. We use a low-pressure, roof-safe cleaning approach to remove staining and help protect your roof's appearance.",
        imageMediaId: serviceRoof,
        icon: "Layers",
        featured: true,
        order: 3,
        active: true,
      },
      {
        name: "Exterior Surface Cleaning",
        slug: "exterior-surface-cleaning",
        shortDescription: "Comprehensive cleaning for siding, walkways, and exterior surfaces.",
        description:
          "From siding to walkways and everything in between, our exterior surface cleaning service is tailored to the specific materials and needs of your property.",
        imageMediaId: concreteAction,
        icon: "SprayCan",
        featured: false,
        order: 4,
        active: true,
      },
      {
        name: "Concrete Cleaning",
        slug: "concrete-cleaning",
        shortDescription: "Deep cleaning for patios, sidewalks, and concrete surfaces.",
        description:
          "Concrete surfaces collect dirt, mold, and stains over time. Our concrete cleaning service uses professional-grade equipment to restore a clean, uniform appearance.",
        imageMediaId: serviceConcrete,
        icon: "Waves",
        featured: false,
        order: 5,
        active: true,
      },
      {
        name: "Patio / Walkway Cleaning",
        slug: "patio-walkway-cleaning",
        shortDescription: "Refresh outdoor living spaces and walkways for guests and family.",
        description:
          "Patios and walkways see heavy foot traffic and weather exposure. We clean these surfaces thoroughly so your outdoor spaces look their best year-round.",
        imageMediaId: concreteAction,
        icon: "Fence",
        featured: false,
        order: 6,
        active: true,
      },
    ]);
    console.log("Seeded 7 services.");
  } else {
    console.log("Services already exist, skipping.");
  }

  // ---------------------------------------------------------- Team members --
  const teamCount = await TeamMember.countDocuments();
  if (teamCount === 0) {
    await TeamMember.insertMany([
      {
        name: "Team Member 1",
        role: "Owner / Lead Technician",
        bio: "Placeholder profile — replace with real team member details from the admin Team page.",
        active: true,
        order: 0,
      },
      {
        name: "Team Member 2",
        role: "Pressure Washing Technician",
        bio: "Placeholder profile — replace with real team member details from the admin Team page.",
        active: true,
        order: 1,
      },
      {
        name: "Team Member 3",
        role: "Customer Service Coordinator",
        bio: "Placeholder profile — replace with real team member details from the admin Team page.",
        active: true,
        order: 2,
      },
    ]);
    console.log("Seeded 3 placeholder team members.");
  } else {
    console.log("Team members already exist, skipping.");
  }

  // -------------------------------------------------------------- Gallery --
  const galleryCount = await GalleryItem.countDocuments();
  if (galleryCount === 0) {
    await GalleryItem.insertMany([
      { title: "House Wash", caption: "Exterior house washing in progress", category: "Houses", imageMediaId: heroHouseWash, order: 0, featured: true, active: true },
      { title: "Modern Home Exterior", caption: "Clean, well-maintained exterior", category: "Houses", imageMediaId: heroModernHome, order: 1, featured: false, active: true },
      { title: "Driveway Cleaning", caption: "Power washing a residential driveway", category: "Driveways", imageMediaId: driveway, order: 0, featured: true, active: true },
      { title: "Window Cleaning", caption: "Exterior window cleaning close-up", category: "Windows", imageMediaId: serviceWindow, order: 0, featured: true, active: true },
      { title: "Roof Washing", caption: "Low-pressure roof cleaning", category: "Roofs", imageMediaId: serviceRoof, order: 0, featured: true, active: true },
      { title: "Roof Before & After", caption: "The difference a professional roof cleaning makes", category: "Before & After", imageMediaId: roofBeforeAfter, order: 0, featured: true, active: true },
      { title: "Concrete Surface Cleaning", caption: "Deep cleaning a concrete surface", category: "Driveways", imageMediaId: concreteAction, order: 1, featured: false, active: true },
      { title: "Concrete Detail", caption: "Surface cleaner in action", category: "Before & After", imageMediaId: serviceConcrete, order: 1, featured: false, active: true },
    ]);
    console.log("Seeded 8 gallery images.");
  } else {
    console.log("Gallery already has items, skipping.");
  }

  // --------------------------------------------------------- Testimonials --
  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany([
      {
        customerName: "Placeholder Customer",
        testimonialText:
          "This is placeholder testimonial content. Replace it with a real customer review from the admin Testimonials page.",
        rating: 5,
        location: "",
        isPlaceholder: true,
        featured: true,
        active: true,
        order: 0,
      },
      {
        customerName: "Placeholder Customer",
        testimonialText:
          "This is placeholder testimonial content. Replace it with a real customer review from the admin Testimonials page.",
        rating: 5,
        location: "",
        isPlaceholder: true,
        featured: true,
        active: true,
        order: 1,
      },
      {
        customerName: "Placeholder Customer",
        testimonialText:
          "This is placeholder testimonial content. Replace it with a real customer review from the admin Testimonials page.",
        rating: 5,
        location: "",
        isPlaceholder: true,
        featured: true,
        active: true,
        order: 2,
      },
    ]);
    console.log("Seeded 3 placeholder testimonials.");
  } else {
    console.log("Testimonials already exist, skipping.");
  }

  // --------------------------------------------------------------- Pages --
  await upsertPage("home", {
    hero: {
      heading: "Dirty Windows, House, Driveway, or Roof?",
      subheading:
        "LR Pressure Washing delivers professional exterior cleaning that restores the look of your property — reliable, affordable, and built to impress.",
      heroImageMediaId: heroModernHome.toString(),
      ctaText: "Get a Free Quote",
      ctaUrl: "/contact",
      secondaryCtaText: "View Our Services",
      secondaryCtaUrl: "/services",
      trustBadges: ["Professional", "Reliable", "Affordable", "Quality Results"],
    },
    benefits: [
      { title: "Professional Service", description: "Every job is handled with care, the right equipment, and attention to detail.", icon: "ShieldCheck", order: 0 },
      { title: "Reliable & On Time", description: "We show up when we say we will and keep you informed throughout the process.", icon: "Clock", order: 1 },
      { title: "Transparent Pricing", description: "Clear, upfront quotes with no surprise fees.", icon: "Tag", order: 2 },
      { title: "Exceptional Results", description: "We take pride in delivering results that exceed expectations.", icon: "Sparkles", order: 3 },
    ],
    whyChooseUs: {
      heading: "Why Choose LR Pressure Washing",
      content:
        "Our mission is to provide reliable, affordable, and professional pressure washing and exterior care services that consistently exceed customer expectations. We build long-term relationships with our clients through exceptional service, transparent pricing, and outstanding results — no matter the size of the project.",
      imageMediaId: heroHouseWash.toString(),
      points: [
        "Reliable, on-time service",
        "Affordable, transparent pricing",
        "Professional results, every time",
        "Careful attention to every detail",
      ],
    },
    process: [
      { title: "Request a Free Quote", description: "Tell us about your project through our simple online form.", icon: "ClipboardList", order: 0 },
      { title: "Schedule Your Service", description: "We'll confirm the details and schedule a time that works for you.", icon: "CalendarCheck", order: 1 },
      { title: "Professional Cleaning", description: "Our team arrives on time and gets to work with professional-grade equipment.", icon: "SprayCan", order: 2 },
      { title: "Enjoy The Results", description: "Step back and enjoy a cleaner, refreshed property.", icon: "PartyPopper", order: 3 },
    ],
    beforeAfter: {
      heading: "See The Difference For Yourself",
      description: "A clean exterior makes an immediate impact. Here's a look at the kind of results our process delivers.",
    },
    serviceArea: {
      heading: "Proudly Serving Your Area",
      description: "Contact us to confirm whether we service your specific location.",
      areas: [],
    },
    cta: {
      heading: "Ready To Bring Your Property Back To Life?",
      description: "Request your free, no-obligation quote today and see the LR Pressure Washing difference.",
      buttonText: "Get a Free Quote",
      buttonUrl: "/contact",
      backgroundImageMediaId: heroModernHome.toString(),
    },
  }, {
    title: "LR Pressure Washing | Professional Exterior Cleaning",
    metaDescription: "Professional pressure washing for houses, driveways, roofs, and windows. Get a free quote today.",
  });

  await upsertPage("about", {
    heading: "About LR Pressure Washing",
    missionStatement:
      "Reliable, affordable, and professional pressure washing and exterior care — built to exceed expectations.",
    content:
      "Our mission is to provide reliable, affordable, and professional pressure washing and exterior care services that consistently exceed customer expectations. We strive to build long-term relationships with our clients by delivering exceptional service, transparent pricing, and outstanding results on every project — no matter the size.",
    imageMediaId: heroHouseWash.toString(),
    values: [
      { title: "Reliability", description: "We show up on time and follow through on every commitment.", icon: "Clock" },
      { title: "Affordability", description: "Fair, transparent pricing for every project we take on.", icon: "Tag" },
      { title: "Professionalism", description: "Trained technicians using professional-grade equipment.", icon: "ShieldCheck" },
      { title: "Attention to Detail", description: "We treat every property like it's our own.", icon: "CheckCircle2" },
    ],
  }, { title: "About Us | LR Pressure Washing", metaDescription: "Learn about LR Pressure Washing's mission to deliver reliable, affordable, professional exterior cleaning." });

  await upsertPage("services", {
    heading: "Our Services",
    intro: "Professional exterior cleaning services for every part of your property.",
  }, { title: "Services | LR Pressure Washing", metaDescription: "Explore our full range of pressure washing and exterior cleaning services." });

  await upsertPage("contact", {
    heading: "Get Your Free Quote",
    intro: "Tell us about your project and we'll get back to you with a free, no-obligation quote.",
    successMessage: "Thank you! Your quote request has been received. We'll be in touch shortly.",
  }, { title: "Contact Us | LR Pressure Washing", metaDescription: "Request a free quote from LR Pressure Washing today." });

  await upsertPage("team", {
    heading: "Meet Our Team",
    intro: "The people behind every job we do.",
  }, { title: "Our Team | LR Pressure Washing", metaDescription: "Meet the LR Pressure Washing team." });

  console.log("\nSeed complete.");
  await mongoose.disconnect();
}

async function upsertPage(
  pageKey: string,
  content: Record<string, unknown>,
  seo: { title: string; metaDescription: string }
) {
  const existing = await Page.findOne({ pageKey });
  if (existing) {
    console.log(`Page "${pageKey}" already exists, skipping.`);
    return;
  }
  await Page.create({
    pageKey,
    content,
    seo: { ...seo, ogTitle: seo.title, ogDescription: seo.metaDescription, canonicalUrl: "" },
    status: "published",
  });
  console.log(`Seeded page content for "${pageKey}".`);
}

function generateRandomPassword(): string {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4).toUpperCase() + "!1";
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
