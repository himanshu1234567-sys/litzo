import mongoose, { Schema } from "mongoose";

const HomeDetailsSchema = new Schema(
  {
    rooms: Schema.Types.Mixed,
    washrooms: Schema.Types.Mixed,
    residents: Schema.Types.Mixed,
    sizeRange: Schema.Types.Mixed,
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    label: Schema.Types.Mixed,
    type: Schema.Types.Mixed,

    addressLine: Schema.Types.Mixed,
    apartmentSector: Schema.Types.Mixed,
    landmark: Schema.Types.Mixed,
    city: Schema.Types.Mixed,
    state: Schema.Types.Mixed,
    pincode: Schema.Types.Mixed,
    country: Schema.Types.Mixed,

    havePets: Schema.Types.Mixed,

    homeDetails: {
      type: HomeDetailsSchema,
      default: {},
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
    default: "user",
    // ❌ enum removed
  },

  firstName: Schema.Types.Mixed,
  lastName: Schema.Types.Mixed,

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
