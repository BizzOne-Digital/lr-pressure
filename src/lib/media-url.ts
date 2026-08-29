/** Builds the public URL for a Media document's binary (served from GridFS). */
export function mediaUrl(id?: string | { toString(): string } | null): string | null {
  if (!id) return null;
  const str = typeof id === "string" ? id : id.toString();
  if (!str) return null;
  return `/api/media/${str}`;
}
