import mongoose, { Schema } from "mongoose";

const AdminNotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["NEW_ORDER"],
      required: true,
    },

    message: String,
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AdminNotification =
  mongoose.models.AdminNotification ||
  mongoose.model("AdminNotification", AdminNotificationSchema);
