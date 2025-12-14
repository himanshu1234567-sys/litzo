import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, addressLine, city, state, pincode, landmark } = await req.json();

    if (!addressLine || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "All address fields required" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          addresses: {
            type,
            addressLine,
            city,
            state,
            pincode,
            landmark,
            isDefault: false,
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      addresses: updatedUser.addresses,
    });
  } catch (err) {
    console.error("Address Add Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
