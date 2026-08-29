import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";
import { galleryItemSchema } from "@/lib/validation";
import { created, ok, handleZodError, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = category ? { category } : {};
    const items = await GalleryItem.find(query).sort({ order: 1, createdAt: 1 }).lean();
    return ok(items);
  } catch (err) {
    return serverError(err, "Failed to load gallery");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = galleryItemSchema.parse(body);
    const item = await GalleryItem.create(data);
    return created(item);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to create gallery item");
  }
}
