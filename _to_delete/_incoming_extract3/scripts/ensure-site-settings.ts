/**
 * Creates the Site Settings singleton document ONLY if it's currently
 * missing — nothing else. Unlike scripts/seed.ts, this touches no other
 * collection (no admin account, no navigation, no services, no team, no
 * placeholder content), so it's safe to run against a database that
 * already has real content but is, for whatever reason, missing this one
 * singleton (for example: SiteSettings.logoMediaId can't be set by
 * scripts/update-logo.ts, or by the admin Settings page, without this
 * document existing first).
 *
 * Safe to run more than once: if the document already exists, this is a
 * no-op.
 *
 * Usage:
 *   npx tsx scripts/ensure-site-settings.ts
 */
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { SiteSettings } from "../src/models/SiteSettings";

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before running this.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
  console.log("Database:", mongoose.connection.db?.databaseName);

  const existing = await SiteSettings.findOne();
  if (existing) {
    console.log("Site settings already exist — nothing to do.");
  } else {
    await SiteSettings.create({
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
    console.log("Created the missing Site Settings document.");
    console.log(
      "Note: this filled in placeholder phone/email/description text — double-check it on the admin Site Settings page and update anything that isn't accurate yet."
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
