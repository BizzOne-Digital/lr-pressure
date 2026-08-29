import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";
import { galleryItemSchema } from "@/lib/validation";
import { ok, notFound, handleZodError, serverError, onlySubmittedKeys } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const parsed = galleryItemSchema.partial().parse(body);
    const data = onlySubmittedKeys(parsed, body);
    const item = await GalleryItem.findByIdAndUpdate(id, data, { new: true });
    if (!item) return notFound("Gallery item not found");
    return ok(item);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update gallery item");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const item = await GalleryItem.findByIdAndDelete(id);
    if (!item) return notFound("Gallery item not found");
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err, "Failed to delete gallery item");
  }
}
