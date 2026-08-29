import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "./db";

const BUCKET_NAME = "media";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export async function getBucket(): Promise<GridFSBucket> {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: BUCKET_NAME });
}

/** Streams a Buffer into GridFS and returns the new file's ObjectId. */
export async function uploadBufferToGridFS(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<ObjectId> {
  const bucket = await getBucket();
  return new Promise((resolve, reject) => {
    // The mongodb driver's GridFS API dropped the top-level `contentType`
    // option; we store it in `metadata` instead and read it back the same way.
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType },
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id as ObjectId));
    uploadStream.end(buffer);
  });
}

export async function deleteFromGridFS(id: ObjectId | string): Promise<void> {
  const bucket = await getBucket();
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  try {
    await bucket.delete(objectId);
  } catch (err) {
    // Already deleted / never existed — treat as success for idempotency.
    if (!(err instanceof Error) || !err.message.includes("FileNotFound")) {
      throw err;
    }
  }
}

export async function readGridFSFile(id: ObjectId | string) {
  const bucket = await getBucket();
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  const files = await bucket.find({ _id: objectId }).toArray();
  const file = files[0];
  if (!file) return null;
  const stream = bucket.openDownloadStream(objectId);
  return { file, stream };
}

export function validateUpload(mimeType: string, size: number): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return `Unsupported file type "${mimeType}". Allowed: JPG, PNG, WEBP, GIF.`;
  }
  if (size > MAX_UPLOAD_BYTES) {
    return `File is too large (${(size / 1024 / 1024).toFixed(1)}MB). Max size is ${
      MAX_UPLOAD_BYTES / 1024 / 1024
    }MB.`;
  }
  return null;
}
