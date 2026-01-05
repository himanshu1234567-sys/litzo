import mongoose, { Schema } from "mongoose";

const HomeDetailsSchema = new Schema(
  {
    rooms: Number,
    washrooms: Number,
    residents: Number,
    sizeRange: {
      type: String,
      enum: [
        "<500",
        "500-999",
        "1000-1999",
        "2000-2999",
        "3000-4999",
        "5000+",
      ],
    },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      default: "Home",
    },

    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

    addressLine: { type: String, required: true },
    landmark: String,
    city: { type: String, required: false },
    state: { type: String, required: false },
    pincode: { type: String, required: false },
    country: { type: String, default: "India" },

    havePets: {
      type: Boolean,
      default: false,
    },

    // 🔥 THIS MUST EXIST
    homeDetails: {
      type: HomeDetailsSchema,
      default: null,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


const UserSchema = new Schema({
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
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
