/**
 * Uploads the client-provided LR Pressure Washing logo (recolored for the
 * site's dark header/footer — white line art with the logo's real maroon-red
 * accents preserved, transparent background) and sets it as the site logo
 * in Site Settings.
 *
 * Safe to run more than once: uploadLocalImage dedupes by filename, and
 * setting logoMediaId to the same resolved id again is a no-op.
 *
 * Usage:
 *   npm run update:logo
 */
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { Media } from "../src/models/Media";
import { SiteSettings } from "../src/models/SiteSettings";

const MONGODB_URI = process.env.MONGODB_URI;
const SEED_ASSETS_DIR = path.join(__dirname, "..", "seed-assets");
const LOGO_FILENAME = "logo-lr-pressure-washing-dark.png";

async function uploadLocalPng(filename: string, alt: string): Promise<mongoose.Types.ObjectId> {
  const existing = await Media.findOne({ filename });
  if (existing) return existing._id;

  const filePath = path.join(SEED_ASSETS_DIR, filename);
  const buffer = fs.readFileSync(filePath);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection");
  const bucket = new GridFSBucket(db, { bucketName: "media" });

  const gridfsId = await new Promise<mongoose.Types.ObjectId>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType: "image/png" },
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id as mongoose.Types.ObjectId));
    uploadStream.end(buffer);
  });

  const media = await Media.create({
    gridfsId,
    filename,
    mimeType: "image/png",
    size: buffer.length,
    alt,
    uploadedBy: "update-logo-script",
  });

  return media._id;
}

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before running this.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const logoId = await uploadLocalPng(
    LOGO_FILENAME,
    "LR Pressure Washing logo"
  );

  const settings = await SiteSettings.findOne();
  if (!settings) {
    console.error("No site settings document found — run the seed script first.");
    process.exit(1);
  }

  if (settings.logoMediaId?.toString() === logoId.toString()) {
    console.log("Site settings already point to this logo, skipping.");
  } else {
    settings.logoMediaId = logoId;
    await settings.save();
    console.log("Updated Site Settings logoMediaId to the new logo.");
  }

  console.log("\nDone.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed to update logo:", err);
  process.exit(1);
});
