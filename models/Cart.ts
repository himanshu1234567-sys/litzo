import mongoose, { Schema, Types } from "mongoose";

const CartItemSchema = new Schema({
  serviceId: { type: Schema.Types.ObjectId, ref: "Service" },

  title: String,
  description: String,
  category: String,
  image: String,

  price: Number,
  discountPrice: Number,

  unitLabel: String,
  quantity: { type: Number, default: 1 },

  baseDuration: Number,
  durationUnit: Number,

  includes: [String],
  excludes: [String]
});

const CartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },

    items: {
      type: [CartItemSchema],
      default: [],
    },

    bookingDetails: {
      addressId: { type: Types.ObjectId },
      addressText: String,

      receiverName: String,
      receiverPhone: String,

      slotDate: String, // "2025-12-14"
      slotTime: String, // "05:00 PM"
    },

    bill: {
      subTotal: { type: Number, default: 0 },
      cleaningFee: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["DRAFT", "LOCKED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

export const Cart =
  mongoose.models.Cart || mongoose.model("Cart", CartSchema);
