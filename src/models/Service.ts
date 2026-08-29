import mongoose, { Schema, models, model } from "mongoose";

export interface IService {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageMediaId?: mongoose.Types.ObjectId;
  icon: string;
  featured: boolean;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, default: "" },
    shortDescription: { type: String, default: "" },
    imageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    icon: { type: String, default: "Sparkles" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ order: 1 });

export const Service = models.Service || model<IService>("Service", ServiceSchema);
