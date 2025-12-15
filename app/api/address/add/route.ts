// app/api/address/add/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      type,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      country = "India",
     
    } = await req.json();

    if (!addressLine || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Required address fields missing" },
        { status: 400 }
      );
    }

    // first address = default
    const isFirst = user.addresses.length === 0;

    user.addresses.push({
      type,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      country,
    
      isDefault: isFirst,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("ADD ADDRESS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
