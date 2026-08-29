import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Media } from "@/models/Media";
import { uploadBufferToGridFS, validateUpload } from "@/lib/gridfs";
import { getCurrentAdmin } from "@/lib/auth";
import { ok, created, fail, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 60), 200);

    const query = search
      ? { $or: [{ filename: { $regex: search, $options: "i" } }, { alt: { $regex: search, $options: "i" } }] }
      : {};

    const items = await Media.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    return ok(items);
  } catch (err) {
    return serverError(err, "Failed to load media");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await getCurrentAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const alt = (formData.get("alt") as string) || "";

    if (!(file instanceof File)) {
      return fail("No file provided", 400);
    }

    const validationError = validateUpload(file.type, file.size);
    if (validationError) {
      return fail(validationError, 422);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const gridfsId = await uploadBufferToGridFS(buffer, file.name, file.type);

    let width: number | undefined;
    let height: number | undefined;
    try {
      const dims = await readImageDimensions(buffer, file.type);
      width = dims?.width;
      height = dims?.height;
    } catch {
      // Non-fatal — dimensions are a nice-to-have for the media library UI.
    }

    const media = await Media.create({
      gridfsId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      width,
      height,
      alt,
      uploadedBy: admin?.email,
    });

    return created(media);
  } catch (err) {
    return serverError(err, "Upload failed");
  }
}

/** Minimal PNG/JPEG/GIF/WEBP dimension sniffing without extra dependencies. */
async function readImageDimensions(
  buffer: Buffer,
  mimeType: string
): Promise<{ width: number; height: number } | null> {
  if (mimeType === "image/png") {
    if (buffer.length < 24) return null;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (mimeType === "image/gif") {
    if (buffer.length < 10) return null;
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }
  if (mimeType === "image/jpeg") {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
    return null;
  }
  // WEBP (simple lossy VP8 header) — best effort, skipped if not the expected format.
  if (mimeType === "image/webp" && buffer.toString("ascii", 0, 4) === "RIFF") {
    const format = buffer.toString("ascii", 12, 16);
    if (format === "VP8 " && buffer.length > 30) {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height };
    }
  }
  return null;
}
