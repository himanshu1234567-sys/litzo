import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      label,
      type,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      country = "India",
      havePets = false,
      homeDetails = null,
    } = await req.json();

    if (!addressLine) {
      return NextResponse.json(
        { error: "Required address fields missing" },
        { status: 400 }
      );
    }

    // First address becomes default
    const isFirst = user.addresses.length === 0;

   // sanitize homeDetails
let sanitizedHomeDetails = homeDetails;

if (homeDetails) {
  sanitizedHomeDetails = {
    ...homeDetails,
    sizeRange:
      homeDetails.sizeRange && homeDetails.sizeRange.trim() !== ""
        ? homeDetails.sizeRange
        : undefined,
  };
}

const newAddress = {
  label,
  type,
  addressLine,
  landmark,
  city,
  state,
  pincode,
  country,
  havePets,
  homeDetails: sanitizedHomeDetails,
  isDefault: isFirst,
};


    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json({
      success: true,

      // ✅ USER BASIC INFO
      user: {
        email: user.email ?? null,
        phone: user.phone,
      },

      // ✅ ADDRESS INFO
      address: newAddress,
      addresses: user.addresses, // optional (keep if FE needs list)
    });
  } catch (err) {
    console.error("ADD ADDRESS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
