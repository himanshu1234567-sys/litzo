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

    // 🛡️ Ensure addresses array exists (CRITICAL FIX)
    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    // 📥 REQUEST BODY
    const body = await req.json();

    const {
      label,
      type,
      addressLine,
      apartmentSector,
      landmark,
      city,
      state,
      pincode,
      country = "India",
      havePets = "no",
      homeDetails = null,
    } = body;

    // ❌ BASIC VALIDATION
    if (!addressLine) {
      return NextResponse.json(
        { error: "Required address fields missing" },
        { status: 400 }
      );
    }

    // ❌ ENUM VALIDATION
    const allowedPets = ["dog", "cat", "no"];
    if (!allowedPets.includes(havePets)) {
      return NextResponse.json(
        { error: "Invalid havePets value. Allowed: dog, cat, no" },
        { status: 400 }
      );
    }

    // ⭐ FIRST ADDRESS DEFAULT
    const isFirst = user.addresses.length === 0;

    // 🧼 SANITIZE homeDetails
    let sanitizedHomeDetails: any = null;

    if (homeDetails && typeof homeDetails === "object") {
      sanitizedHomeDetails = {
        ...homeDetails,
        sizeRange:
          typeof homeDetails.sizeRange === "string" &&
          homeDetails.sizeRange.trim() !== ""
            ? homeDetails.sizeRange.trim()
            : undefined,
      };
    }

    // 🏠 NEW ADDRESS OBJECT
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

    // 💾 SAVE
    user.addresses.push(newAddress);
    await user.save(); // must be mongoose document (no .lean())

    // ✅ RESPONSE
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
