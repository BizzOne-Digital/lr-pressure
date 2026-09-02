import mongoose, { Schema, models, model } from "mongoose";

export interface IProject {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  summary: string;
  description: string;
  imageMediaId?: mongoose.Types.ObjectId;
  beforeImageMediaId?: mongoose.Types.ObjectId;
  afterImageMediaId?: mongoose.Types.ObjectId;
  location: string;
  serviceSlug: string;
  featured: boolean;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    imageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    beforeImageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    afterImageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    location: { type: String, default: "" },
    serviceSlug: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ order: 1 });

export const Project = models.Project || model<IProject>("Project", ProjectSchema);
