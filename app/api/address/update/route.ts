import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      addressId,
      addressLine,
      city,
      state,
      pincode,
      landmark,
      label,
      havePets,
      homeDetails,
    } = await req.json();

    if (!addressId) {
      return NextResponse.json(
        { error: "addressId is required" },
        { status: 400 }
      );
    }

    const updateFields: any = {};

    if (addressLine !== undefined)
      updateFields["addresses.$.addressLine"] = addressLine;
    if (city !== undefined)
      updateFields["addresses.$.city"] = city;
    if (state !== undefined)
      updateFields["addresses.$.state"] = state;
    if (pincode !== undefined)
      updateFields["addresses.$.pincode"] = pincode;
    if (landmark !== undefined)
      updateFields["addresses.$.landmark"] = landmark;
    if (label !== undefined)
      updateFields["addresses.$.label"] = label;
    if (havePets !== undefined)
      updateFields["addresses.$.havePets"] = havePets;
    if (homeDetails !== undefined)
      updateFields["addresses.$.homeDetails"] = homeDetails;

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, "addresses._id": addressId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Address not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      addresses: updatedUser.addresses,
    });
  } catch (err) {
    console.error("Update Address Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
