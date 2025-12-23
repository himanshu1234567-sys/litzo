import mongoose, { Schema, Types } from "mongoose";

const UserCouponSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User" },
    couponId: { type: Types.ObjectId, ref: "Coupon" },

    isUsed: { type: Boolean, default: false },
    usedAt: Date,
  },
  { timestamps: true }
);

UserCouponSchema.index({ userId: 1, couponId: 1 }, { unique: true });

export const UserCoupon =
  mongoose.models.UserCoupon ||
  mongoose.model("UserCoupon", UserCouponSchema);
