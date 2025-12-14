import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { addressId, addressLine, city, state, pincode, landmark } = await req.json();

    console.log("Updating address:", addressId);

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.addressLine": addressLine,
          "addresses.$.city": city,
          "addresses.$.state": state,
          "addresses.$.pincode": pincode,
          "addresses.$.landmark": landmark,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "Address NOT updated" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      addresses: updatedUser.addresses
    });
  } catch (err) {
    console.error("Update Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
