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

    // 📥 REQUEST BODY (allow empty / missing fields)
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
      havePets = "no",
      homeDetails = null,
    } = body || {};

    // 🧼 Sanitize homeDetails safely
    let sanitizedHomeDetails: any = null;

    if (homeDetails && typeof homeDetails === "object") {
      sanitizedHomeDetails = {
        ...homeDetails,
        sizeRange:
          typeof homeDetails.sizeRange === "string"
            ? homeDetails.sizeRange.trim()
            : undefined,
      };
    }

    // ⭐ First address default
    const isFirst = user.addresses.length === 0;

    // 🏠 Address object (no validation)
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
      havePets, // accepts blank or any string
      homeDetails: sanitizedHomeDetails,
      isDefault: isFirst,
    };

    // 💾 Save
    user.addresses.push(newAddress);
    await user.save();

    // ✅ Success
    return NextResponse.json({
      success: true,
      user: {
        email: user.email ?? null,
        phone: user.phone ?? null,
      },
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
