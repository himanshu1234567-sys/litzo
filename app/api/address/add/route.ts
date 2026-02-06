import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 AUTH
    const user: any = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🛡️ Ensure addresses array exists
    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    // 📥 REQUEST BODY
    const body = await req.json();

    const {
      label = "",
      type = "",
      addressLine = "",
      apartmentSector = "",
      landmark = "",
      city = "",
      state = "",
      pincode = "",
      country = "India",
      havePets = "",
      homeDetails = {},
    } = body || {};

    // 🧼 Sanitize homeDetails (your exact fields)
    const sanitizedHomeDetails = {
      rooms: homeDetails?.rooms ?? "",
      washrooms: homeDetails?.washrooms ?? "",
      residents: homeDetails?.residents ?? "",
      sizeRange: homeDetails?.sizeRange ?? "",
    };

    // ⭐ First address default
    const isFirst = user.addresses.length === 0;

    // 🏠 New address
    const newAddress = {
      label,
      type,
      addressLine,
      apartmentSector,
      landmark,
      city,
      state,
      pincode,
      country,
      havePets,
      homeDetails: sanitizedHomeDetails,
      isDefault: isFirst,
    };

    // 💾 Save
    user.addresses.push(newAddress);
    await user.save();

    // ✅ Response
    return NextResponse.json({
      success: true,
      address: newAddress,
      addresses: user.addresses,
    });
  } catch (err: any) {
    console.error("ADD ADDRESS ERROR:", err?.message || err);
    return NextResponse.json(
      { error: "Server error", message: err?.message },
      { status: 500 }
    );
  }
}
