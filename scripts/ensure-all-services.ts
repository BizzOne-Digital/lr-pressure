/**
 * Adds any of the original 11 core services that are missing from the
 * `services` collection — using the exact same name/description/icon/image
 * content authored in scripts/seed.ts's initial seed data, never inventing
 * anything new. Each service is checked individually by slug before being
 * created, so this is safe to run any number of times and will never
 * duplicate a service or touch one that already exists (including any
 * admin edits made to it).
 *
 * Why this script exists: scripts/seed.ts only seeds the `services`
 * collection when it's completely empty. If a database's `services`
 * collection already had *some* documents in it the first time seed.ts
 * ran (from an earlier, smaller version of the seed data), later additions
 * to seed.ts's service list never get backfilled — this script closes
 * exactly that gap, for services only. It does not touch team members,
 * testimonials, service plans, gallery items, or anything else.
 *
 * Usage:
 *   npx tsx scripts/ensure-all-services.ts
 */
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { Media } from "../src/models/Media";
import { Service } from "../src/models/Service";
import { SERVICE_CONTENT } from "./service-content-data";

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
    uploadedBy: "ensure-all-services-script",
  });
  console.log(`Uploaded image "${filename}".`);
  return media._id;
}

async function addServiceIfMissing(service: {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageMediaId: mongoose.Types.ObjectId;
  icon: string;
  featured: boolean;
  order: number;
}) {
  const existing = await Service.findOne({ slug: service.slug });
  if (existing) {
    console.log(`Service "${service.name}" already exists, skipping.`);
    return;
  }
  const entry = SERVICE_CONTENT[service.slug] ?? {};
  await Service.create({ ...service, ...entry, active: true });
  console.log(`Added service "${service.name}".`);
}

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before running this.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
  console.log("Database:", mongoose.connection.db?.databaseName);

  const realSidingBeforeAfter = await uploadLocalImage(
    "real-siding-before-after.jpg",
    "Vinyl siding before and after a soft-wash house cleaning"
  );
  const driveway = await uploadLocalImage("driveway-action.jpg", "Power washing a driveway");
  const serviceWindow = await uploadLocalImage("service-window.jpg", "Window cleaning close up");
  const serviceRoof = await uploadLocalImage("service-roof-2.jpg", "Low pressure roof washing");
  const realStuccoChimneyBeforeAfter = await uploadLocalImage(
    "real-stucco-chimney-before-after.jpg",
    "Stucco chimney before and after cleaning"
  );
  const realConcreteWalkwayBeforeAfter = await uploadLocalImage(
    "real-concrete-walkway-before-after.jpg",
    "Concrete walkway before and after pressure washing"
  );
  const realPatioBeforeAfter = await uploadLocalImage(
    "real-patio-paver-before-after.jpg",
    "Paver patio before and after pressure washing"
  );

  await addServiceIfMissing({
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
  });

  await addServiceIfMissing({
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
  });

  await addServiceIfMissing({
    name: "Window Cleaning",
    slug: "window-cleaning",
    shortDescription: "Streak-free exterior window cleaning for a brighter, better-looking home.",
    description:
      "Exterior window cleaning removes the dirt, water spots, and grime that dull your view and your home's overall appearance. We clean the glass, frames, and sills on the outside of your windows, using tools and techniques suited to your window type to get a clear, streak-free finish.\n\nWe start with a quick walk-around to see what we're working with, protect anything nearby that needs it, then clean each window methodically before a final check to make sure nothing was missed.\n\nClean windows brighten up the whole exterior of a home and are one of the fastest, most noticeable improvements you can make to curb appeal.",
    imageMediaId: serviceWindow,
    icon: "AppWindow",
    featured: true,
    order: 2,
  });

  await addServiceIfMissing({
    name: "Roof Cleaning",
    slug: "roof-cleaning",
    shortDescription: "Low-pressure roof washing that safely lifts algae stains and streaks.",
    description:
      "Dark streaks and stains on a roof are usually algae, moss, or organic buildup rather than dirt alone, and they only get worse over time if left untreated. We use a low-pressure, roof-safe washing method rather than high-pressure equipment, since high pressure can lift or damage shingles and shorten a roof's lifespan.\n\nWe check the roof type and condition first, then apply an appropriate cleaning solution to break down staining and buildup, letting it do the work rather than relying on pressure — followed by a careful rinse.\n\nBeyond the visual improvement, removing algae and moss buildup helps protect the roofing material itself and can help prevent the kind of moisture retention that leads to bigger problems down the road.",
    imageMediaId: serviceRoof,
    icon: "Layers",
    featured: true,
    order: 3,
  });

  await addServiceIfMissing({
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
  });

  await addServiceIfMissing({
    name: "Concrete Cleaning",
    slug: "concrete-cleaning",
    shortDescription: "Deep cleaning that restores patios, sidewalks, and other concrete surfaces.",
    description:
      "Concrete is porous, which means dirt, mold, algae, and stains work their way into the surface over time rather than just sitting on top of it. Our concrete cleaning service uses professional-grade pressure washing equipment and, where needed, cleaning solutions to lift buildup out of the surface rather than just rinsing the top layer.\n\nWe clean methodically with a surface cleaner for even coverage across sidewalks, patios, and other concrete areas, avoiding the striped or blotchy look that comes from an uneven manual pass, and give extra attention to stained or heavily soiled spots.\n\nThe result is a uniform, restored appearance — and concrete that's easier to keep looking clean going forward.",
    imageMediaId: realConcreteWalkwayBeforeAfter,
    icon: "Waves",
    featured: false,
    order: 5,
  });

  await addServiceIfMissing({
    name: "Patio / Walkway Cleaning",
    slug: "patio-walkway-cleaning",
    shortDescription: "Refresh outdoor living spaces and walkways for family, guests, and everyday use.",
    description:
      "Patios and walkways see constant foot traffic and weather exposure, which means dirt, algae, and grime build up faster than on less-used surfaces. We clean these areas thoroughly, using a pressure and method suited to the paving material — whether that's concrete, pavers, brick, or stone — so your outdoor living spaces look their best.\n\nWe pay attention to the joints and edges where dirt and moss tend to collect, not just the open surface area, for a more complete clean rather than a quick surface pass.\n\nWell-maintained patios and walkways make outdoor spaces more inviting year-round, and cleaner surfaces are also less slippery, since algae and moss buildup can create a slip hazard over time.",
    imageMediaId: realPatioBeforeAfter,
    icon: "Fence",
    featured: false,
    order: 6,
  });

  console.log("\nDone.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
