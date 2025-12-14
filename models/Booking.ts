import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    addressId: { type: Schema.Types.ObjectId, required: true },

    bookingDate: { type: String, required: true }, // "2025-12-15"
    startTime: { type: String, required: true },   // "02:00 PM"
    endTime: { type: String, required: true },     // "03:00 PM"

    duration: { type: Number, required: true },    // minutes
    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
