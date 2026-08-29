import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Media } from "@/models/Media";
import { deleteFromGridFS } from "@/lib/gridfs";
import { ok, notFound, serverError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const alt = typeof body.alt === "string" ? body.alt.slice(0, 300) : undefined;

    const media = await Media.findByIdAndUpdate(
      id,
      { ...(alt !== undefined ? { alt } : {}) },
      { new: true }
    );
    if (!media) return notFound("Media not found");
    return ok(media);
  } catch (err) {
    return serverError(err, "Failed to update media");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const media = await Media.findById(id);
    if (!media) return notFound("Media not found");

    await deleteFromGridFS(media.gridfsId);
    await media.deleteOne();

    return ok({ deleted: true });
  } catch (err) {
    return serverError(err, "Failed to delete media");
  }
}
