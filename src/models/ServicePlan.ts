import mongoose, { Schema, models, model } from "mongoose";

export interface IServicePlan {
  _id: mongoose.Types.ObjectId;
  name: string;
  tagline: string;
  frequency: string;
  features: string[];
  priceLabel: string;
  imageMediaId?: mongoose.Types.ObjectId;
  highlighted: boolean;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServicePlanSchema = new Schema<IServicePlan>(
  {
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    frequency: { type: String, default: "" },
    features: { type: [String], default: [] },
    priceLabel: { type: String, default: "Contact for Pricing" },
    imageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    highlighted: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServicePlanSchema.index({ order: 1 });

export const ServicePlan = models.ServicePlan || model<IServicePlan>("ServicePlan", ServicePlanSchema);
