import mongoose, { Schema } from "mongoose";

const AddressSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

    addressLine: { type: String, required: true }, // full address text
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    landmark: { type: String },

    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);
const UserSchema = new Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    unique: true,
    sparse: true, // ✅ allow multiple nulls
  },

  password: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  firstName: String,
  lastName: String,

  addresses: {
    type: [AddressSchema],
    default: [],
  },

  isProfileCompleted: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
