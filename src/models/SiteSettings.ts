import mongoose, { Schema, models, model } from "mongoose";

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  logoMediaId?: mongoose.Types.ObjectId;
  faviconMediaId?: mongoose.Types.ObjectId;
  phone: string;
  email: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    google?: string;
    tiktok?: string;
    youtube?: string;
  };
  primaryCtaText: string;
  primaryCtaUrl: string;
  footerText: string;
  businessDescription: string;
  seoDefaults: {
    title: string;
    description: string;
    ogImageMediaId?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    businessName: { type: String, required: true, default: "LR Pressure Washing" },
    logoMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    faviconMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    phone: { type: String, required: true, default: "" },
    email: { type: String, required: true, default: "" },
    address: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      google: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    primaryCtaText: { type: String, default: "Get a Free Quote" },
    primaryCtaUrl: { type: String, default: "/contact" },
    footerText: { type: String, default: "" },
    businessDescription: { type: String, default: "" },
    seoDefaults: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      ogImageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    },
  },
  { timestamps: true }
);

export const SiteSettings =
  models.SiteSettings || model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
