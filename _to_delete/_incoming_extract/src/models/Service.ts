import mongoose, { Schema, models, model } from "mongoose";

export interface IServiceProcessStep {
  title: string;
  description: string;
  icon: string;
}

export interface IServiceFaq {
  question: string;
  answer: string;
}

export interface IService {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageMediaId?: mongoose.Types.ObjectId;
  icon: string;
  // "Why choose us for this service" checklist bullets shown in the
  // individual service-page overview section.
  benefits: string[];
  // Dedicated per-service "Our {Service} Process" numbered steps. Falls
  // back to the sitewide homepage process steps when empty.
  processSteps: IServiceProcessStep[];
  // Dedicated per-service FAQ accordion. Falls back to the sitewide
  // services-page FAQ defaults when empty.
  faqs: IServiceFaq[];
  featured: boolean;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceProcessStepSchema = new Schema<IServiceProcessStep>(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    icon: { type: String, default: "ClipboardList" },
  },
  { _id: false }
);

const ServiceFaqSchema = new Schema<IServiceFaq>(
  {
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, default: "" },
    shortDescription: { type: String, default: "" },
    imageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    icon: { type: String, default: "Sparkles" },
    benefits: { type: [String], default: [] },
    processSteps: { type: [ServiceProcessStepSchema], default: [] },
    faqs: { type: [ServiceFaqSchema], default: [] },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ order: 1 });

export const Service = models.Service || model<IService>("Service", ServiceSchema);
