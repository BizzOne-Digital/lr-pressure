import mongoose, { Schema, models, model } from "mongoose";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/constants";

// Re-exported for server-side code that already imports these from here
// (API routes, seed script). Client components should import from
// "@/lib/constants" directly instead, to avoid pulling mongoose into the
// browser bundle.
export { GALLERY_CATEGORIES };
export type { GalleryCategory };

export interface IGalleryItem {
  _id: mongoose.Types.ObjectId;
  title: string;
  caption: string;
  category: GalleryCategory;
  imageMediaId: mongoose.Types.ObjectId;
  featured: boolean;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    title: { type: String, required: true, default: "" },
    caption: { type: String, default: "" },
    category: { type: String, enum: GALLERY_CATEGORIES, required: true },
    imageMediaId: { type: Schema.Types.ObjectId, ref: "Media", required: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GalleryItemSchema.index({ category: 1, order: 1 });

export const GalleryItem =
  models.GalleryItem || model<IGalleryItem>("GalleryItem", GalleryItemSchema);
