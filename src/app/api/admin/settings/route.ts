import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { siteSettingsSchema } from "@/lib/validation";
import { ok, handleZodError, serverError } from "@/lib/api-response";

async function getOrCreateSettings() {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
}

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await getOrCreateSettings();
    return ok(settings);
  } catch (err) {
    return serverError(err, "Failed to load site settings");
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = siteSettingsSchema.parse(body);

    const settings = await getOrCreateSettings();
    Object.assign(settings, data);
    await settings.save();

    return ok(settings);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update site settings");
  }
}
