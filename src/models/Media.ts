import mongoose, { Schema, models, model } from "mongoose";

/**
 * Metadata record for a file stored in GridFS ("media" bucket).
 * The actual binary bytes live in media.files / media.chunks (GridFS),
 * never on the local filesystem. This document makes the media library
 * searchable/filterable and lets us attach alt text, dimensions, etc.
 */
export interface IMedia {
  _id: mongoose.Types.ObjectId;
  gridfsId: mongoose.Types.ObjectId;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    gridfsId: { type: Schema.Types.ObjectId, required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, default: "" },
    uploadedBy: { type: String },
  },
  { timestamps: true }
);

export const Media = models.Media || model<IMedia>("Media", MediaSchema);
