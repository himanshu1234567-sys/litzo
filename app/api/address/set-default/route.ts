import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { addressId } = await req.json();

    // Step 1: Reset all addresses
    await User.updateOne(
      { _id: user._id },
      { $set: { "addresses.$[].isDefault": false } }
    );

    // Step 2: Set default
    await User.updateOne(
      { _id: user._id, "addresses._id": addressId },
      { $set: { "addresses.$.isDefault": true } }
    );

    return NextResponse.json({
      success: true,
      message: "Default address updated"
    });

  } catch (err) {
    console.error("Set Default Address Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}