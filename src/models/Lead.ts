import mongoose, { Schema, models, model } from "mongoose";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants";

// Re-exported for server-side code that already imports these from here.
// Client components should import from "@/lib/constants" directly.
export { LEAD_STATUSES };
export type { LeadStatus };

export interface ILeadNote {
  text: string;
  createdAt: Date;
}

export interface ILead {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  address: string;
  serviceNeeded: string;
  preferredDate?: string;
  message: string;
  imageMediaId?: mongoose.Types.ObjectId;
  status: LeadStatus;
  notes: ILeadNote[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadNoteSchema = new Schema<ILeadNote>(
  {
    text: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, default: "" },
    serviceNeeded: { type: String, default: "" },
    preferredDate: { type: String, default: "" },
    message: { type: String, default: "" },
    imageMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    status: { type: String, enum: LEAD_STATUSES, default: "New" },
    notes: { type: [LeadNoteSchema], default: [] },
  },
  { timestamps: true }
);

LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ name: "text", email: "text", phone: "text" });

export const Lead = models.Lead || model<ILead>("Lead", LeadSchema);
