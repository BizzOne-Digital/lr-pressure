import mongoose, { Schema, models, model } from "mongoose";

export interface ITeamMember {
  _id: mongoose.Types.ObjectId;
  name: string;
  role: string;
  bio: string;
  photoMediaId?: mongoose.Types.ObjectId;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true, default: "" },
    bio: { type: String, default: "" },
    photoMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TeamMember =
  models.TeamMember || model<ITeamMember>("TeamMember", TeamMemberSchema);
