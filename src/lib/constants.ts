/**
 * Plain constants shared between server (Mongoose models, API routes) and
 * client components. Client components must import from here rather than
 * from src/models/* — importing a Mongoose model file pulls the `mongoose`
 * package (and Node-only deps like the MongoDB driver) into the browser
 * bundle, which breaks the build.
 */

export const GALLERY_CATEGORIES = [
  "Houses",
  "Driveways",
  "Windows",
  "Roofs",
  "Before & After",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Quote Sent",
  "Scheduled",
  "Completed",
  "Cancelled",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
