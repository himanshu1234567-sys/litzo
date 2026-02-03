import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
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
      apartmentSector, // ✅ NEW FIELD
      landmark,
      city,
      state,
      pincode,
      country = "India",
      havePets = "no", // ✅ STRING ENUM
      homeDetails = null,
    } = await req.json();

    // ✅ Basic validation
    if (!addressLine) {
      return NextResponse.json(
        { error: "Required address fields missing" },
        { status: 400 }
      );
    }

    // ✅ Validate havePets
    const allowedPets = ["dog", "cat", "no"];
    if (!allowedPets.includes(havePets)) {
      return NextResponse.json(
        { error: "Invalid havePets value. Allowed: dog, cat, no" },
        { status: 400 }
      );
    }

    // ✅ First address becomes default
    const isFirst = user.addresses.length === 0;

    // ✅ Sanitize homeDetails
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

    // ✅ New address object
    const newAddress = {
      label,
      type,
      addressLine,
      apartmentSector, // ✅ SAVED
      landmark,
      city,
      state,
      pincode,
      country,
      havePets, // ✅ STRING VALUE
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
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("ADD ADDRESS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
