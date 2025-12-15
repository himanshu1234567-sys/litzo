import mongoose, { Schema, Types } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    cartId: { type: Types.ObjectId, ref: "Cart", required: true },

    items: { type: Array, required: true }, // snapshot
    bookingDetails: { type: Object, required: true },
    bill: { type: Object, required: true },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    orderStatus: {
      type: String,
      enum: ["CREATED", "CONFIRMED", "CANCELLED"],
      default: "CREATED",
    },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
