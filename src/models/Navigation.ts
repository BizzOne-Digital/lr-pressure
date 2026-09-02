import mongoose, { Schema, models, model } from "mongoose";

export interface INavItem {
  label: string;
  href: string;
  order: number;
  visible: boolean;
  // Distinct from `visible`: an item can stay in the footer's full link list
  // while being left out of the minimal top header menu.
  showInHeader: boolean;
}

export interface INavigation {
  _id: mongoose.Types.ObjectId;
  items: INavItem[];
  createdAt: Date;
  updatedAt: Date;
}

const NavItemSchema = new Schema<INavItem>(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    visible: { type: Boolean, required: true, default: true },
    showInHeader: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const NavigationSchema = new Schema<INavigation>(
  {
    items: { type: [NavItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Navigation =
  models.Navigation || model<INavigation>("Navigation", NavigationSchema);
