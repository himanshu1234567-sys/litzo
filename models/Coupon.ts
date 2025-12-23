import mongoose, { Schema, Types } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, unique: true, required: true },

    type: {
      type: String,
      enum: ["FLAT", "PERCENT"],
      required: true,
    },

    value: { type: Number, required: true }, // 100 or 10%

    minBillAmount: { type: Number, default: 300 }, // ✅ REQUIRED

    maxDiscount: Number, // percent coupon only

    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },

    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
