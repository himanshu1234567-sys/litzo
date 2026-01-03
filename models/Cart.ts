import mongoose, { Schema, Types } from "mongoose";

/* ---------------- CART ITEM ---------------- */
const CartItemSchema = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    title: { type: String, required: true },
    description: String,
    category: String,
    image: String,

    price: { type: Number, required: true },
    discountPrice: Number,

    unitLabel: { type: String, required: true },

    // 🔢 quantity-based services
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ⏱️ minutes-based services
    baseDuration: {
      type: Number,
      min: 0,
    },
    durationUnit: {
      type: Number,
      min: 1,
    },

    includes: {
      type: [String],
      default: [],
    },
    excludes: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

/* ---------------- CART ---------------- */
const CartSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [CartItemSchema],
      default: [],
    },

    /* 🔖 Coupon flags */
    couponApplied: {
      type: Boolean,
      default: false,
    },

    appliedCoupon: {
      couponId: {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
      },
      code: String,
      discountAmount: {
        type: Number,
        default: 0,
      },
    },

    /* 📦 Booking info */
    bookingDetails: {
      addressId: { type: Types.ObjectId },
      addressText: String,

      receiverName: String,
      receiverPhone: String,

      slotDate: String,
      slotTime: String,
    },

    /* 💰 Bill */
    bill: {
      subTotal: { type: Number, default: 0 },
      cleaningFee: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      cleaningKitFee: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["DRAFT", "LOCKED"],
      default: "DRAFT",
      index: true,
    },
  },
  { timestamps: true }
);

/* 🔐 One active cart per user */
CartSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "DRAFT" } }
);

export const Cart =
  mongoose.models.Cart || mongoose.model("Cart", CartSchema);
