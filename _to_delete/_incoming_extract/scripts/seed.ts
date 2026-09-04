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
import { SERVICE_CONTENT } from "./service-content-data";

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
  const windowDetailSiding = await uploadLocalImage(
    "window-detail-siding.jpg",
    "Close-up of clean exterior windows and screens"
  );
  const christmasLightsHouse = await uploadLocalImage(
    "christmas-lights-house.jpg",
    "House exterior decorated with holiday string lights"
  );
  // Real client photos (LR Pressure Washing's own before/after work) —
  // used as the primary image for their matching services instead of stock.
  const realInteriorWindow = await uploadLocalImage(
    "real-interior-window-view.jpg",
    "View through a freshly cleaned interior window"
  );
  const realPatioBeforeAfter = await uploadLocalImage(
    "real-patio-paver-before-after.jpg",
    "Paver patio before and after pressure washing"
  );
  const realSidingBeforeAfter = await uploadLocalImage(
    "real-siding-before-after.jpg",
    "Vinyl siding before and after a soft-wash house cleaning"
  );
  const realConcreteWalkwayBeforeAfter = await uploadLocalImage(
    "real-concrete-walkway-before-after.jpg",
    "Concrete walkway before and after pressure washing"
  );
  const realStuccoChimneyBeforeAfter = await uploadLocalImage(
    "real-stucco-chimney-before-after.jpg",
    "Stucco chimney before and after cleaning"
  );

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
        { label: "Home", href: "/", order: 0, visible: true, showInHeader: true },
        { label: "About", href: "/about", order: 1, visible: true, showInHeader: true },
        { label: "Services", href: "/services", order: 2, visible: true, showInHeader: true },
        { label: "Service Plans", href: "/service-plans", order: 3, visible: true, showInHeader: false },
        { label: "Gallery", href: "/gallery", order: 4, visible: true, showInHeader: true },
        { label: "Our Team", href: "/team", order: 5, visible: true, showInHeader: false },
        { label: "Reviews", href: "/reviews", order: 6, visible: true, showInHeader: false },
        { label: "Projects", href: "/projects", order: 7, visible: true, showInHeader: false },
        { label: "Contact", href: "/contact", order: 8, visible: true, showInHeader: true },
      ],
    });
    console.log("Seeded navigation (minimal header menu; full list still in the footer).");
  } else {
    console.log("Navigation already exists, skipping.");
  }

  // ------------------------------------------------------------- Services --
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    const baseServices = [
      {
        name: "House Washing",
        slug: "house-washing",
        shortDescription:
          "Soft-wash exterior cleaning that lifts dirt, mildew, and algae without harming your siding.",
        description:
          "House washing removes the dirt, algae, mildew, and general grime that build up on siding, trim, and other exterior surfaces over time. We use a soft-wash approach — lower water pressure paired with an appropriate cleaning solution — rather than blasting your home with high pressure, since aggressive pressure can force water behind siding or damage paint and caulking.\n\nBefore we start, we walk the property to check the siding material and note anything that needs extra care or protection, like plants, outdoor furniture, or light fixtures. We then apply the cleaning solution, let it work on the buildup, and rinse everything down for an even, streak-free result, finishing with a walkthrough so you can see the difference for yourself.\n\nA clean exterior makes a real difference in curb appeal, and regular washing also helps prevent the kind of long-term buildup that can quietly wear down paint and siding over the years.",
        imageMediaId: realSidingBeforeAfter,
        icon: "Home",
        featured: true,
        order: 0,
        active: true,
      },
      {
        name: "Driveway Cleaning",
        slug: "driveway-cleaning",
        shortDescription:
          "Pressure washing that lifts oil stains, tire marks, and years of buildup from your driveway.",
        description:
          "Driveways take a beating — oil drips, tire marks, dirt, and organic growth all build up on concrete and asphalt over time, and ordinary rinsing doesn't touch it. Our driveway cleaning service uses professional pressure washing equipment, sized to the surface, to break up and lift that buildup without damaging the material underneath.\n\nWe start by looking at the driveway's condition and material to choose the right pressure and technique, then work section by section with a surface cleaner for even, streak-free results — no more blotchy patches from an uneven manual pass. Stubborn stains get targeted extra attention before a final rinse.\n\nThe result is a driveway that looks close to new again, and a cleaner surface is also easier to keep that way, since dirt and algae have less to grip onto once the buildup is gone.",
        imageMediaId: driveway,
        icon: "Car",
        featured: true,
        order: 1,
        active: true,
      },
      {
        name: "Window Cleaning",
        slug: "window-cleaning",
        shortDescription: "Streak-free exterior window cleaning for a brighter, better-looking home.",
        description:
          "Exterior window cleaning removes the dirt, water spots, and grime that dull your view and your home's overall appearance. We clean the glass, frames, and sills on the outside of your windows, using tools and techniques suited to your window type to get a clear, streak-free finish.\n\nWe start with a quick walk-around to see what we're working with, protect anything nearby that needs it, then clean each window methodically before a final check to make sure nothing was missed.\n\nClean windows brighten up the whole exterior of a home and are one of the fastest, most noticeable improvements you can make to curb appeal.",
        imageMediaId: serviceWindow,
        icon: "AppWindow",
        featured: true,
        order: 2,
        active: true,
      },
      {
        name: "Roof Cleaning",
        slug: "roof-cleaning",
        shortDescription: "Low-pressure roof washing that safely lifts algae stains and streaks.",
        description:
          "Dark streaks and stains on a roof are usually algae, moss, or organic buildup rather than dirt alone, and they only get worse over time if left untreated. We use a low-pressure, roof-safe washing method rather than high-pressure equipment, since high pressure can lift or damage shingles and shorten a roof's lifespan.\n\nWe check the roof type and condition first, then apply an appropriate cleaning solution to break down staining and buildup, letting it do the work rather than relying on pressure — followed by a careful rinse.\n\nBeyond the visual improvement, removing algae and moss buildup helps protect the roofing material itself and can help prevent the kind of moisture retention that leads to bigger problems down the road.",
        imageMediaId: serviceRoof,
        icon: "Layers",
        featured: true,
        order: 3,
        active: true,
      },
      {
        name: "Exterior Surface Cleaning",
        slug: "exterior-surface-cleaning",
        shortDescription:
          "Comprehensive cleaning for siding, fencing, and other exterior surfaces around your property.",
        description:
          "Not every exterior surface fits into a single category — siding, fencing, outdoor furniture, dumpster pads, and other exterior surfaces all collect dirt and grime differently. Our exterior surface cleaning service is a flexible option for the surfaces around your property that need attention but don't fall neatly under our other named services.\n\nWe assess the specific material and condition of each surface and choose a cleaning method and pressure level appropriate to it, so delicate materials aren't over-pressured and tougher materials get the attention they need.\n\nIf you're not sure which service fits what you need cleaned, contact us and describe the surface — we're happy to advise on the right approach.",
        imageMediaId: realStuccoChimneyBeforeAfter,
        icon: "SprayCan",
        featured: false,
        order: 4,
        active: true,
      },
      {
        name: "Concrete Cleaning",
        slug: "concrete-cleaning",
        shortDescription: "Deep cleaning that restores patios, sidewalks, and other concrete surfaces.",
        description:
          "Concrete is porous, which means dirt, mold, algae, and stains work their way into the surface over time rather than just sitting on top of it. Our concrete cleaning service uses professional-grade pressure washing equipment and, where needed, cleaning solutions to lift buildup out of the surface rather than just rinsing the top layer.\n\nWe clean methodically with a surface cleaner for even coverage across sidewalks, patios, and other concrete areas, avoiding the striped or blotchy look that comes from an uneven manual pass, and give extra attention to stained or heavily soiled spots.\n\nThe result is a uniform, restored appearance — and concrete that's easier to keep looking clean going forward.",
        imageMediaId: realConcreteWalkwayBeforeAfter,
        icon: "Waves",
        featured: false,
        order: 5,
        active: true,
      },
      {
        name: "Patio / Walkway Cleaning",
        slug: "patio-walkway-cleaning",
        shortDescription: "Refresh outdoor living spaces and walkways for family, guests, and everyday use.",
        description:
          "Patios and walkways see constant foot traffic and weather exposure, which means dirt, algae, and grime build up faster than on less-used surfaces. We clean these areas thoroughly, using a pressure and method suited to the paving material — whether that's concrete, pavers, brick, or stone — so your outdoor living spaces look their best.\n\nWe pay attention to the joints and edges where dirt and moss tend to collect, not just the open surface area, for a more complete clean rather than a quick surface pass.\n\nWell-maintained patios and walkways make outdoor spaces more inviting year-round, and cleaner surfaces are also less slippery, since algae and moss buildup can create a slip hazard over time.",
        imageMediaId: realPatioBeforeAfter,
        icon: "Fence",
        featured: false,
        order: 6,
        active: true,
      },
      {
        name: "Interior Window Cleaning",
        slug: "interior-window-cleaning",
        shortDescription: "Streak-free cleaning for the inside of your windows, to match the outside.",
        description:
          "Exterior window cleaning only shows half the picture — smudges, dust, and hard-water spots on the inside of the glass are just as noticeable from indoors. Our interior window cleaning service covers the glass, frames, and sills throughout your home's interior for a matching, truly streak-free finish on both sides.\n\nWe take care to protect furniture, floors, and window treatments while we work, and finish with a check of each window before moving on, so nothing gets missed.\n\nPairing interior and exterior window cleaning gives you the clearest possible view and the most natural light throughout your home.",
        imageMediaId: realInteriorWindow,
        icon: "AppWindow",
        featured: false,
        order: 7,
        active: true,
      },
      {
        name: "Screen Cleaning",
        slug: "screen-cleaning",
        shortDescription: "Removing built-up dust, pollen, and grime from window screens.",
        description:
          "Window screens collect dust, pollen, and grime that regular window cleaning doesn't reach, and over time that buildup can noticeably dull the view through them — even when the glass itself is spotless. Our screen cleaning service removes each screen, cleans it thoroughly, and reinstalls it so it looks as clear as the freshly cleaned window behind it.\n\nWe inspect screens before cleaning to note any existing damage, clean them carefully to avoid stretching or tearing the mesh, and do a final check once they're back in place.\n\nClean screens let more light and air through and go a long way toward making freshly washed windows look their best.",
        imageMediaId: windowDetailSiding,
        icon: "Droplets",
        featured: false,
        order: 8,
        active: true,
      },
      {
        name: "Christmas Light Installation",
        slug: "christmas-light-installation",
        shortDescription: "Professional holiday light installation and takedown, without the ladder.",
        description:
          "Putting up holiday lighting means ladder work, tangled strands, and figuring out how to secure everything safely to your roofline, gutters, or trees — and then doing it all again in reverse to take it down. We handle the full installation and takedown so you can enjoy the season without the hassle or the risk of climbing around your own roofline.\n\nWe talk through what you have in mind for your property, install the lighting securely so it holds up through winter weather, and return after the season to take everything down and put it away.\n\nContact us to discuss your property, your lighting plan, and what you'd like installed — we'll take it from there.",
        imageMediaId: christmasLightsHouse,
        icon: "PartyPopper",
        featured: false,
        order: 9,
        active: true,
      },
      {
        name: "Pressure Washing",
        slug: "pressure-washing",
        shortDescription: "General-purpose pressure washing for pool decks, fences, pavers, and more.",
        description:
          "Beyond driveways, siding, and roofs, plenty of surfaces around a property benefit from a professional pressure wash — pool decks, retaining walls, fences, brick and stone surfaces, curbs, and paver patios all collect dirt, algae, and grime over time. Our pressure washing service covers these broader hardscape and surface cleaning needs with equipment and pressure levels matched to each material.\n\nWe assess the surface first — different materials call for different pressure levels and techniques, and using the wrong amount of pressure can damage softer materials like wood fencing or aging pavers — then clean methodically for even, thorough coverage, with extra attention to stained or heavily soiled areas.\n\nIf you have a surface around your property that doesn't fit neatly into our other services, get in touch and describe what needs cleaning — pressure washing is a flexible option for exactly that kind of job.",
        imageMediaId: driveway,
        icon: "Gauge",
        featured: false,
        order: 10,
        active: true,
      },
    ];
    await Service.insertMany(
      baseServices.map((s) => ({ ...s, ...(SERVICE_CONTENT[s.slug] ?? {}) }))
    );
    console.log("Seeded 11 services.");
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

  await upsertPage("gallery", {
    heading: "Our Work",
    intro: "A look at recent projects across our service area.",
  }, { title: "Gallery | LR Pressure Washing", metaDescription: "Browse photos of recent LR Pressure Washing projects." });

  await upsertPage("projects", {
    heading: "Featured Projects",
    intro: "A closer look at select jobs, from start to finish.",
  }, { title: "Projects | LR Pressure Washing", metaDescription: "Featured pressure washing and exterior cleaning projects completed by LR Pressure Washing." });

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
