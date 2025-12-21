  import mongoose, { Schema, Types } from "mongoose";

  const BookingDetailsSchema = new Schema(
    {
      slotDate: {
        type: Date,
        required: true,
      },
      slotTime: {
        type: String,
        required: true,
      },
      addressText: {
        type: String,
        required: true,
      },
      receiverName: {
        type: String,
        required: true,
      },
      receiverPhone: {
        type: String,
        required: true,
      },
    },
    { _id: false }
  );

  const OrderSchema = new Schema(
    {
      userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },

      cartId: {
        type: Types.ObjectId,
        ref: "Cart",
        required: true,
      },

      items: {
        type: [Object],
        required: true,
      },

      bookingDetails: {
        type: BookingDetailsSchema,
        required: true,
      },

      bill: {
        type: Object,
        required: true,
      },

      // 💳 Payment
      razorpayOrderId: String,
      razorpayPaymentId: String,

      paymentStatus: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING",
      },

      // 📦 Order lifecycle
      orderStatus: {
        type: String,
        enum: ["CREATED", "CONFIRMED", "CANCELLED"],
        default: "CREATED",
      },
    },
    {
      timestamps: true,
    }
  );

  export const Order =
    mongoose.models.Order || mongoose.model("Order", OrderSchema);
