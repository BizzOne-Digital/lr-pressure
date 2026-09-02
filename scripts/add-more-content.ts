/**
 * Adds MORE sample gallery photos, placeholder testimonials, placeholder
 * service plan tiers, and the Service Plans / Reviews page heading & intro
 * text to a database that's already been seeded (npm run seed only seeds a
 * collection the first time — it intentionally never touches a collection
 * that already has items, so it won't add more later). This script is
 * separate and additive: safe to run as many times as you like, it checks
 * for each item by a stable key (title, name, or pageKey) before inserting
 * so nothing is ever duplicated.
 *
 * Service plan pricing is never invented — every plan's priceLabel defaults
 * to "Contact for Pricing" (free text, editable from the admin Service Plans
 * page) until real pricing is confirmed.
 *
 * Use this if the site feels a little sparse after the initial seed and you
 * want more sample content to fill it out while you gather real photos,
 * reviews, and pricing.
 *
 * Usage:
 *   npm run seed:more
 */
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { Media } from "../src/models/Media";
import { GalleryItem } from "../src/models/GalleryItem";
import { Testimonial } from "../src/models/Testimonial";
import { ServicePlan } from "../src/models/ServicePlan";
import { Page } from "../src/models/Page";
import { Navigation } from "../src/models/Navigation";
import { Service } from "../src/models/Service";

const MONGODB_URI = process.env.MONGODB_URI;
const SEED_ASSETS_DIR = path.join(__dirname, "..", "seed-assets");

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

async function addGalleryItemIfMissing(item: {
  title: string;
  caption: string;
  category: string;
  imageMediaId: mongoose.Types.ObjectId;
  order: number;
  featured: boolean;
}) {
  const existing = await GalleryItem.findOne({ title: item.title });
  if (existing) {
    console.log(`Gallery item "${item.title}" already exists, skipping.`);
    return;
  }
  await GalleryItem.create({ ...item, active: true });
  console.log(`Added gallery item "${item.title}".`);
}

async function addTestimonialIfMissing(marker: string, data: {
  customerName: string;
  testimonialText: string;
  rating: number;
  order: number;
}) {
  // Placeholder testimonials all share generic text, so we key uniqueness
  // off the `order` slot rather than the text itself.
  const existing = await Testimonial.findOne({ order: data.order, isPlaceholder: true });
  if (existing) {
    console.log(`Placeholder testimonial #${data.order} already exists, skipping.`);
    return;
  }
  await Testimonial.create({
    ...data,
    location: "",
    isPlaceholder: true,
    featured: data.order < 3,
    active: true,
  });
  console.log(`Added placeholder testimonial #${data.order}.`);
}

async function addServicePlanIfMissing(plan: {
  name: string;
  tagline: string;
  frequency: string;
  features: string[];
  priceLabel: string;
  highlighted: boolean;
  order: number;
}) {
  const existing = await ServicePlan.findOne({ name: plan.name });
  if (existing) {
    console.log(`Service plan "${plan.name}" already exists, skipping.`);
    return;
  }
  await ServicePlan.create({ ...plan, active: true });
  console.log(`Added service plan "${plan.name}".`);
}

async function setServiceImageIfMissing(slug: string, imageMediaId: mongoose.Types.ObjectId) {
  const service = await Service.findOne({ slug });
  if (!service) {
    console.log(`Service "${slug}" not found, skipping image backfill.`);
    return;
  }
  if (service.imageMediaId) {
    console.log(`Service "${slug}" already has an image, skipping.`);
    return;
  }
  service.imageMediaId = imageMediaId;
  await service.save();
  console.log(`Added a placeholder image to service "${slug}".`);
}

// Expands a service's short blurb into the full, complete description —
// but only if the description still exactly matches the old short default.
// If an admin has already edited it through the CMS, this leaves their
// edit alone rather than overwriting real content.
async function updateServiceCopyIfUnchanged(
  slug: string,
  oldDescription: string,
  newShortDescription: string,
  newDescription: string
) {
  const service = await Service.findOne({ slug });
  if (!service) {
    console.log(`Service "${slug}" not found, skipping description update.`);
    return;
  }
  if (service.description !== oldDescription) {
    console.log(`Service "${slug}" description already customized, skipping.`);
    return;
  }
  service.shortDescription = newShortDescription;
  service.description = newDescription;
  await service.save();
  console.log(`Expanded description for service "${slug}".`);
}

async function setServicePlanImageIfMissing(name: string, imageMediaId: mongoose.Types.ObjectId) {
  const plan = await ServicePlan.findOne({ name });
  if (!plan) {
    console.log(`Service plan "${name}" not found, skipping image backfill.`);
    return;
  }
  if (plan.imageMediaId) {
    console.log(`Service plan "${name}" already has an image, skipping.`);
    return;
  }
  plan.imageMediaId = imageMediaId;
  await plan.save();
  console.log(`Added an image to service plan "${name}".`);
}

async function upsertPageIfMissing(
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

async function addServiceIfMissing(service: {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  order: number;
}) {
  const existing = await Service.findOne({ slug: service.slug });
  if (existing) {
    console.log(`Service "${service.name}" already exists, skipping.`);
    return;
  }
  await Service.create({ ...service, featured: false, active: true });
  console.log(`Added service "${service.name}".`);
}

async function addNavItemIfMissing(item: { label: string; href: string; showInHeader?: boolean }) {
  const nav = await Navigation.findOne();
  if (!nav) {
    console.log(`No navigation document exists yet, skipping nav item "${item.label}".`);
    return;
  }
  const exists = (nav.items ?? []).some((i: { href: string }) => i.href === item.href);
  if (exists) {
    console.log(`Nav item "${item.label}" already exists, skipping.`);
    return;
  }
  const nextOrder = (nav.items ?? []).length;
  nav.items.push({
    label: item.label,
    href: item.href,
    order: nextOrder,
    visible: true,
    showInHeader: item.showInHeader ?? true,
  });
  await nav.save();
  console.log(`Added nav item "${item.label}" -> ${item.href}.`);
}

async function setNavItemShowInHeader(href: string, showInHeader: boolean) {
  const nav = await Navigation.findOne();
  if (!nav) return;
  const item = (nav.items ?? []).find((i: { href: string }) => i.href === href);
  if (!item) {
    console.log(`Nav item for "${href}" not found, skipping header-visibility update.`);
    return;
  }
  if (item.showInHeader === showInHeader) {
    console.log(`Nav item for "${href}" already has showInHeader=${showInHeader}, skipping.`);
    return;
  }
  item.showInHeader = showInHeader;
  await nav.save();
  console.log(`Set showInHeader=${showInHeader} for nav item "${href}" (minimal header menu).`);
}

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before running this.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.\n");

  const houseSiding = await uploadLocalImage("house-siding-new.jpg", "House exterior with clean vinyl siding");
  const roofBeachHouse = await uploadLocalImage("roof-beach-house.jpg", "Two-story house with clean asphalt shingle roof");
  const windowSiding = await uploadLocalImage("window-detail-siding.jpg", "Close-up of clean exterior windows and siding");
  const windowBay = await uploadLocalImage("window-detail-bay.jpg", "Close-up of a clean bay window with stone siding");
  const heroHouseWashForBackfill = await uploadLocalImage("hero-house-wash.jpg", "Pressure washing a house exterior");
  const drivewayForBackfill = await uploadLocalImage("driveway-action.jpg", "Power washing a driveway");
  const christmasLightsHouse = await uploadLocalImage(
    "christmas-lights-house.jpg",
    "House exterior decorated with holiday string lights"
  );

  const existingGalleryCount = await GalleryItem.countDocuments();
  const nextOrder = existingGalleryCount; // append after whatever's already there

  await addGalleryItemIfMissing({
    title: "Siding Wash — Split-Level Home",
    caption: "Soft-wash siding cleaning on a split-level house",
    category: "Houses",
    imageMediaId: houseSiding,
    order: nextOrder,
    featured: true,
  });

  await addGalleryItemIfMissing({
    title: "Roof Wash — Two-Story Home",
    caption: "Low-pressure roof cleaning on a two-story home",
    category: "Roofs",
    imageMediaId: roofBeachHouse,
    order: nextOrder + 1,
    featured: false,
  });

  await addGalleryItemIfMissing({
    title: "Window Detail — Siding & Trim",
    caption: "Streak-free windows after an exterior cleaning",
    category: "Windows",
    imageMediaId: windowSiding,
    order: nextOrder + 2,
    featured: true,
  });

  await addGalleryItemIfMissing({
    title: "Window Detail — Bay Window",
    caption: "Clean bay window and stone siding detail",
    category: "Windows",
    imageMediaId: windowBay,
    order: nextOrder + 3,
    featured: false,
  });

  console.log("");

  const placeholderTestimonials = [
    {
      customerName: "Placeholder Customer",
      testimonialText:
        "This is placeholder testimonial content. Replace it with a real customer review from the admin Testimonials page.",
      rating: 5,
      order: 3,
    },
    {
      customerName: "Placeholder Customer",
      testimonialText:
        "This is placeholder testimonial content. Replace it with a real customer review from the admin Testimonials page.",
      rating: 4,
      order: 4,
    },
  ];

  for (const t of placeholderTestimonials) {
    await addTestimonialIfMissing(t.customerName, t);
  }

  console.log("");

  // Placeholder service plan tiers. No prices are invented — priceLabel is
  // free text defaulting to "Contact for Pricing" until real pricing is
  // provided; everything here is editable from the admin Service Plans page.
  await addServicePlanIfMissing({
    name: "Seasonal Refresh",
    tagline: "A single deep clean to reset your property's curb appeal.",
    frequency: "One-Time",
    features: ["House or roof soft-wash", "Driveway & walkway cleaning", "Free follow-up quote for future visits"],
    priceLabel: "Contact for Pricing",
    highlighted: false,
    order: 0,
  });

  await addServicePlanIfMissing({
    name: "Maintenance Plan",
    tagline: "Recurring cleanings to keep your property looking its best year-round.",
    frequency: "Quarterly",
    features: ["House wash", "Driveway & walkway cleaning", "Window exterior rinse", "Priority scheduling"],
    priceLabel: "Contact for Pricing",
    highlighted: true,
    order: 1,
  });

  await addServicePlanIfMissing({
    name: "Complete Care Plan",
    tagline: "Comprehensive coverage for every exterior surface, twice a year.",
    frequency: "Twice a Year",
    features: ["House wash", "Roof soft-wash", "Driveway & walkway cleaning", "Window exterior cleaning", "Priority scheduling"],
    priceLabel: "Contact for Pricing",
    highlighted: false,
    order: 2,
  });

  // Backfill images onto the plan cards so they're not text-only.
  await setServicePlanImageIfMissing("Seasonal Refresh", heroHouseWashForBackfill);
  await setServicePlanImageIfMissing("Maintenance Plan", houseSiding);
  await setServicePlanImageIfMissing("Complete Care Plan", roofBeachHouse);

  console.log("");

  await upsertPageIfMissing(
    "service-plans",
    {
      heading: "Service Plans",
      intro:
        "Recurring maintenance plans to keep your property looking its best year-round. Pricing is customized per property — contact us for a personalized quote.",
    },
    {
      title: "Service Plans | LR Pressure Washing",
      metaDescription: "Recurring maintenance plans from LR Pressure Washing to keep your property looking its best year-round.",
    }
  );

  await upsertPageIfMissing(
    "reviews",
    {
      heading: "Customer Reviews",
      intro: "See what our customers have to say about our work.",
    },
    {
      title: "Reviews | LR Pressure Washing",
      metaDescription: "Read customer reviews for LR Pressure Washing.",
    }
  );

  await upsertPageIfMissing(
    "gallery",
    {
      heading: "Our Work",
      intro: "A look at recent projects across our service area.",
    },
    {
      title: "Gallery | LR Pressure Washing",
      metaDescription: "Browse photos of recent LR Pressure Washing projects.",
    }
  );

  await upsertPageIfMissing(
    "projects",
    {
      heading: "Featured Projects",
      intro: "A closer look at select jobs, from start to finish.",
    },
    {
      title: "Projects | LR Pressure Washing",
      metaDescription: "Featured pressure washing and exterior cleaning projects completed by LR Pressure Washing.",
    }
  );

  console.log("");

  // Confirmed-real additional services (client confirmed LR performs these).
  const serviceWindowForBackfill = await uploadLocalImage(
    "service-window.jpg",
    "Window cleaning close up"
  );

  await addServiceIfMissing({
    name: "Interior Window Cleaning",
    slug: "interior-window-cleaning",
    shortDescription: "Streak-free cleaning for the inside of your windows.",
    description:
      "In addition to exterior window cleaning, we offer interior window cleaning to get a truly streak-free, spotless finish on both sides of the glass.",
    icon: "AppWindow",
    order: 7,
  });
  await setServiceImageIfMissing("interior-window-cleaning", serviceWindowForBackfill);

  await addServiceIfMissing({
    name: "Screen Cleaning",
    slug: "screen-cleaning",
    shortDescription: "Removing built-up dust and grime from window screens.",
    description:
      "Window screens collect dust, pollen, and grime that regular cleaning misses. We remove, clean, and reinstall your screens so they look as clear as your freshly cleaned windows.",
    icon: "Droplets",
    order: 8,
  });
  await setServiceImageIfMissing("screen-cleaning", windowSiding);

  await addServiceIfMissing({
    name: "Christmas Light Installation",
    slug: "christmas-light-installation",
    shortDescription: "Professional holiday light installation and takedown, without the ladder.",
    description:
      "Putting up holiday lighting means ladder work, tangled strands, and figuring out how to secure everything safely to your roofline, gutters, or trees — and then doing it all again in reverse to take it down. We handle the full installation and takedown so you can enjoy the season without the hassle or the risk of climbing around your own roofline.\n\nWe talk through what you have in mind for your property, install the lighting securely so it holds up through winter weather, and return after the season to take everything down and put it away.\n\nContact us to discuss your property, your lighting plan, and what you'd like installed — we'll take it from there.",
    icon: "PartyPopper",
    order: 9,
  });
  // A real photo of holiday lighting on a house is now sourced (see
  // seed-assets/CREDITS.md) — backfill it onto any DB where this service
  // was created earlier without one.
  await setServiceImageIfMissing("christmas-light-installation", christmasLightsHouse);

  // New: general Pressure Washing service (client-confirmed) covering the
  // broader hardscapes not named individually elsewhere — pool decks,
  // retaining walls, fencing, brick/stone, pavers, curbs.
  await addServiceIfMissing({
    name: "Pressure Washing",
    slug: "pressure-washing",
    shortDescription: "General-purpose pressure washing for pool decks, fences, pavers, and more.",
    description:
      "Beyond driveways, siding, and roofs, plenty of surfaces around a property benefit from a professional pressure wash — pool decks, retaining walls, fences, brick and stone surfaces, curbs, and paver patios all collect dirt, algae, and grime over time. Our pressure washing service covers these broader hardscape and surface cleaning needs with equipment and pressure levels matched to each material.\n\nWe assess the surface first — different materials call for different pressure levels and techniques, and using the wrong amount of pressure can damage softer materials like wood fencing or aging pavers — then clean methodically for even, thorough coverage, with extra attention to stained or heavily soiled areas.\n\nIf you have a surface around your property that doesn't fit neatly into our other services, get in touch and describe what needs cleaning — pressure washing is a flexible option for exactly that kind of job.",
    icon: "Gauge",
    order: 10,
  });
  await setServiceImageIfMissing("pressure-washing", drivewayForBackfill);

  console.log("");

  // Expand every existing service's short blurb into a complete description
  // (what's included, process, benefits) — only where the description still
  // matches the original short default, so any admin edits made through the
  // CMS are left untouched.
  await updateServiceCopyIfUnchanged(
    "house-washing",
    "Our house washing service uses a careful soft-wash technique to safely remove dirt, algae, and mildew from your siding without damaging your home's exterior. The result is a noticeably brighter, cleaner-looking property.",
    "Soft-wash exterior cleaning that lifts dirt, mildew, and algae without harming your siding.",
    "House washing removes the dirt, algae, mildew, and general grime that build up on siding, trim, and other exterior surfaces over time. We use a soft-wash approach — lower water pressure paired with an appropriate cleaning solution — rather than blasting your home with high pressure, since aggressive pressure can force water behind siding or damage paint and caulking.\n\nBefore we start, we walk the property to check the siding material and note anything that needs extra care or protection, like plants, outdoor furniture, or light fixtures. We then apply the cleaning solution, let it work on the buildup, and rinse everything down for an even, streak-free result, finishing with a walkthrough so you can see the difference for yourself.\n\nA clean exterior makes a real difference in curb appeal, and regular washing also helps prevent the kind of long-term buildup that can quietly wear down paint and siding over the years."
  );

  await updateServiceCopyIfUnchanged(
    "driveway-cleaning",
    "Oil stains, tire marks, and years of buildup can leave a driveway looking tired. Our pressure washing process restores concrete and asphalt driveways to a clean, like-new appearance.",
    "Pressure washing that lifts oil stains, tire marks, and years of buildup from your driveway.",
    "Driveways take a beating — oil drips, tire marks, dirt, and organic growth all build up on concrete and asphalt over time, and ordinary rinsing doesn't touch it. Our driveway cleaning service uses professional pressure washing equipment, sized to the surface, to break up and lift that buildup without damaging the material underneath.\n\nWe start by looking at the driveway's condition and material to choose the right pressure and technique, then work section by section with a surface cleaner for even, streak-free results — no more blotchy patches from an uneven manual pass. Stubborn stains get targeted extra attention before a final rinse.\n\nThe result is a driveway that looks close to new again, and a cleaner surface is also easier to keep that way, since dirt and algae have less to grip onto once the buildup is gone."
  );

  await updateServiceCopyIfUnchanged(
    "window-cleaning",
    "Clean windows make a real difference in how your property looks and feels. We carefully clean exterior window surfaces and frames, removing dirt and grime for a clear, streak-free finish.",
    "Streak-free exterior window cleaning for a brighter, better-looking home.",
    "Exterior window cleaning removes the dirt, water spots, and grime that dull your view and your home's overall appearance. We clean the glass, frames, and sills on the outside of your windows, using tools and techniques suited to your window type to get a clear, streak-free finish.\n\nWe start with a quick walk-around to see what we're working with, protect anything nearby that needs it, then clean each window methodically before a final check to make sure nothing was missed.\n\nClean windows brighten up the whole exterior of a home and are one of the fastest, most noticeable improvements you can make to curb appeal."
  );

  await updateServiceCopyIfUnchanged(
    "roof-cleaning",
    "Dark streaks and stains on a roof are often caused by algae and organic buildup. We use a low-pressure, roof-safe cleaning approach to remove staining and help protect your roof's appearance.",
    "Low-pressure roof washing that safely lifts algae stains and streaks.",
    "Dark streaks and stains on a roof are usually algae, moss, or organic buildup rather than dirt alone, and they only get worse over time if left untreated. We use a low-pressure, roof-safe washing method rather than high-pressure equipment, since high pressure can lift or damage shingles and shorten a roof's lifespan.\n\nWe check the roof type and condition first, then apply an appropriate cleaning solution to break down staining and buildup, letting it do the work rather than relying on pressure — followed by a careful rinse.\n\nBeyond the visual improvement, removing algae and moss buildup helps protect the roofing material itself and can help prevent the kind of moisture retention that leads to bigger problems down the road."
  );

  await updateServiceCopyIfUnchanged(
    "exterior-surface-cleaning",
    "From siding to walkways and everything in between, our exterior surface cleaning service is tailored to the specific materials and needs of your property.",
    "Comprehensive cleaning for siding, fencing, and other exterior surfaces around your property.",
    "Not every exterior surface fits into a single category — siding, fencing, outdoor furniture, dumpster pads, and other exterior surfaces all collect dirt and grime differently. Our exterior surface cleaning service is a flexible option for the surfaces around your property that need attention but don't fall neatly under our other named services.\n\nWe assess the specific material and condition of each surface and choose a cleaning method and pressure level appropriate to it, so delicate materials aren't over-pressured and tougher materials get the attention they need.\n\nIf you're not sure which service fits what you need cleaned, contact us and describe the surface — we're happy to advise on the right approach."
  );

  await updateServiceCopyIfUnchanged(
    "concrete-cleaning",
    "Concrete surfaces collect dirt, mold, and stains over time. Our concrete cleaning service uses professional-grade equipment to restore a clean, uniform appearance.",
    "Deep cleaning that restores patios, sidewalks, and other concrete surfaces.",
    "Concrete is porous, which means dirt, mold, algae, and stains work their way into the surface over time rather than just sitting on top of it. Our concrete cleaning service uses professional-grade pressure washing equipment and, where needed, cleaning solutions to lift buildup out of the surface rather than just rinsing the top layer.\n\nWe clean methodically with a surface cleaner for even coverage across sidewalks, patios, and other concrete areas, avoiding the striped or blotchy look that comes from an uneven manual pass, and give extra attention to stained or heavily soiled spots.\n\nThe result is a uniform, restored appearance — and concrete that's easier to keep looking clean going forward."
  );

  await updateServiceCopyIfUnchanged(
    "patio-walkway-cleaning",
    "Patios and walkways see heavy foot traffic and weather exposure. We clean these surfaces thoroughly so your outdoor spaces look their best year-round.",
    "Refresh outdoor living spaces and walkways for family, guests, and everyday use.",
    "Patios and walkways see constant foot traffic and weather exposure, which means dirt, algae, and grime build up faster than on less-used surfaces. We clean these areas thoroughly, using a pressure and method suited to the paving material — whether that's concrete, pavers, brick, or stone — so your outdoor living spaces look their best.\n\nWe pay attention to the joints and edges where dirt and moss tend to collect, not just the open surface area, for a more complete clean rather than a quick surface pass.\n\nWell-maintained patios and walkways make outdoor spaces more inviting year-round, and cleaner surfaces are also less slippery, since algae and moss buildup can create a slip hazard over time."
  );

  await updateServiceCopyIfUnchanged(
    "interior-window-cleaning",
    "In addition to exterior window cleaning, we offer interior window cleaning to get a truly streak-free, spotless finish on both sides of the glass.",
    "Streak-free cleaning for the inside of your windows, to match the outside.",
    "Exterior window cleaning only shows half the picture — smudges, dust, and hard-water spots on the inside of the glass are just as noticeable from indoors. Our interior window cleaning service covers the glass, frames, and sills throughout your home's interior for a matching, truly streak-free finish on both sides.\n\nWe take care to protect furniture, floors, and window treatments while we work, and finish with a check of each window before moving on, so nothing gets missed.\n\nPairing interior and exterior window cleaning gives you the clearest possible view and the most natural light throughout your home."
  );

  await updateServiceCopyIfUnchanged(
    "screen-cleaning",
    "Window screens collect dust, pollen, and grime that regular cleaning misses. We remove, clean, and reinstall your screens so they look as clear as your freshly cleaned windows.",
    "Removing built-up dust, pollen, and grime from window screens.",
    "Window screens collect dust, pollen, and grime that regular window cleaning doesn't reach, and over time that buildup can noticeably dull the view through them — even when the glass itself is spotless. Our screen cleaning service removes each screen, cleans it thoroughly, and reinstalls it so it looks as clear as the freshly cleaned window behind it.\n\nWe inspect screens before cleaning to note any existing damage, clean them carefully to avoid stretching or tearing the mesh, and do a final check once they're back in place.\n\nClean screens let more light and air through and go a long way toward making freshly washed windows look their best."
  );

  await updateServiceCopyIfUnchanged(
    "christmas-light-installation",
    "We install and take down holiday lighting for your home, so you can enjoy the season without climbing a ladder. Contact us to discuss your property and lighting plan.",
    "Professional holiday light installation and takedown, without the ladder.",
    "Putting up holiday lighting means ladder work, tangled strands, and figuring out how to secure everything safely to your roofline, gutters, or trees — and then doing it all again in reverse to take it down. We handle the full installation and takedown so you can enjoy the season without the hassle or the risk of climbing around your own roofline.\n\nWe talk through what you have in mind for your property, install the lighting securely so it holds up through winter weather, and return after the season to take everything down and put it away.\n\nContact us to discuss your property, your lighting plan, and what you'd like installed — we'll take it from there."
  );

  console.log("");

  await addNavItemIfMissing({ label: "Service Plans", href: "/service-plans", showInHeader: false });
  await addNavItemIfMissing({ label: "Reviews", href: "/reviews", showInHeader: false });
  await addNavItemIfMissing({ label: "Gallery", href: "/gallery", showInHeader: true });
  await addNavItemIfMissing({ label: "Our Team", href: "/team", showInHeader: false });
  await addNavItemIfMissing({ label: "Projects", href: "/projects", showInHeader: false });

  console.log("");

  // Keep the header menu minimal — these stay in the footer's full link list
  // but drop out of the top nav bar. Safe to run repeatedly; only flips the
  // flag when it's not already set this way.
  await setNavItemShowInHeader("/service-plans", false);
  await setNavItemShowInHeader("/team", false);
  await setNavItemShowInHeader("/reviews", false);
  await setNavItemShowInHeader("/projects", false);

  console.log("\nDone. Refresh the site to see the additional content.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to add content:", err);
  process.exit(1);
});
