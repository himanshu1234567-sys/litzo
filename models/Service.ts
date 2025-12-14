import mongoose, { Schema, model, models } from "mongoose";

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    category: { type: String, default: "General" },
    image: { type: String },

    price: { type: Number, required: true },
    discountPrice: { type: Number },

    baseDuration: { type: Number },        // e.g., 30
    unitLabel: { type: String },           // e.g., "minutes"
    pricePerUnit: { type: Number },        // e.g., 60 per 15 mins extra

    durationUnit: { type: Number, default: 15 },

    includes: { type: [String], default: [] },
    excludes: { type: [String], default: [] },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Service = models.Service || model("Service", ServiceSchema);
