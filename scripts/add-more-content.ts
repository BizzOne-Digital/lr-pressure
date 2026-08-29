/**
 * Adds MORE sample gallery photos and placeholder testimonials to a database
 * that's already been seeded (npm run seed only seeds a collection the first
 * time — it intentionally never touches a collection that already has items,
 * so it won't add more later). This script is separate and additive: safe to
 * run as many times as you like, it checks for each item by title before
 * inserting so nothing is ever duplicated.
 *
 * Use this if the site feels a little sparse after the initial seed and you
 * want more sample content to fill it out while you gather real photos and
 * reviews.
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

  console.log("\nDone. Refresh the site to see the additional content.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to add content:", err);
  process.exit(1);
});
