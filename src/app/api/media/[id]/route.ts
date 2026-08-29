import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { readGridFSFile } from "@/lib/gridfs";
import { Media } from "@/models/Media";

// Public, unauthenticated route: serves image binaries stored in GridFS.
// Cached aggressively since media ids are content-addressed (a replace
// operation creates a new GridFS id rather than mutating bytes in place).
//
// The `id` in the URL is the Media document's `_id` (that's what every
// `imageMediaId`/`photoMediaId` field across the app stores, and what
// mediaUrl()/ImageUpload build links from) — NOT the underlying GridFS
// file id, which is a separate ObjectId stored on the Media document as
// `gridfsId`. We look up the Media doc first to resolve the real GridFS id.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const media = await Media.findById(id).lean();
    if (!media) {
      return new NextResponse("Not found", { status: 404 });
    }

    const result = await readGridFSFile(media.gridfsId.toString());
    if (!result) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { file, stream } = result;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          media.mimeType || (file.metadata?.contentType as string) || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse("Server error", { status: 500 });
  }
}
