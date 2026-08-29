import mongoose, { Schema, models, model } from "mongoose";

export interface ITestimonial {
  _id: mongoose.Types.ObjectId;
  customerName: string;
  testimonialText: string;
  rating: number;
  photoMediaId?: mongoose.Types.ObjectId;
  location: string;
  isPlaceholder: boolean;
  featured: boolean;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true },
    testimonialText: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    photoMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    location: { type: String, default: "" },
    isPlaceholder: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Testimonial =
  models.Testimonial || model<ITestimonial>("Testimonial", TestimonialSchema);
