import mongoose, { Schema, models, model } from "mongoose";

export const PAGE_KEYS = ["home", "about", "services", "contact", "team"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export interface ISEO {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageMediaId?: mongoose.Types.ObjectId;
  canonicalUrl: string;
}

export interface IPage {
  _id: mongoose.Types.ObjectId;
  pageKey: PageKey;
  status: "draft" | "published";
  // Flexible per-page content blob. Shape depends on pageKey; validated at the
  // API layer with zod schemas per page rather than a rigid Mongoose sub-schema,
  // so the CMS can evolve without migrations.
  content: Record<string, unknown>;
  seo: ISEO;
  createdAt: Date;
  updatedAt: Date;
}

const SEOSchema = new Schema<ISEO>(
  {
    title: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    canonicalUrl: { type: String, default: "" },
  },
  { _id: false }
);

const PageSchema = new Schema<IPage>(
  {
    pageKey: { type: String, enum: PAGE_KEYS, required: true, unique: true },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    content: { type: Schema.Types.Mixed, default: {} },
    seo: { type: SEOSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Page = models.Page || model<IPage>("Page", PageSchema);
