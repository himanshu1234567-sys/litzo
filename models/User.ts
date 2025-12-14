import mongoose, { Schema } from "mongoose";

const AddressSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema({
  phone: { type: String },

  email: { type: String },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  firstName: { type: String },
  lastName: { type: String },

  isProfileCompleted: { type: Boolean, default: false },

  addresses: {
    type: [AddressSchema],
    default: []
  },

  createdAt: { type: Date, default: Date.now }
});


export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
