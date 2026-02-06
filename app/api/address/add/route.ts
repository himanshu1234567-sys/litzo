import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 AUTH (only this check)
    const user: any = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🛡️ Safety: ensure array exists
    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    // 📥 Read body AS-IS
    const body = await req.json();

    // ⭐ First address default
    const isFirst = user.addresses.length === 0;

    // 🏠 Address object (NO validation, NO defaults)
    const newAddress = {
      label: body?.label,
      type: body?.type,
      addressLine: body?.addressLine,
      apartmentSector: body?.apartmentSector,
      landmark: body?.landmark,
      city: body?.city,
      state: body?.state,
      pincode: body?.pincode,
      country: body?.country,
      havePets: body?.havePets,
      homeDetails: body?.homeDetails,
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
    console.error("ADD ADDRESS ERROR:", err);
    return NextResponse.json(
      { error: "Server error", message: err?.message },
      { status: 500 }
    );
  }
}
