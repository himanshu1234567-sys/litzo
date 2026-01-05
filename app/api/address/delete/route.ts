// app/api/address/delete/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { addressId } = await req.json();

    if (!addressId) {
      return NextResponse.json(
        { error: "addressId is required" },
        { status: 400 }
      );
    }

    const beforeCount = user.addresses.length;

    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== addressId
    );

    if (user.addresses.length === beforeCount) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // 🔐 ensure at least one default address
    if (!user.addresses.some((a: any) => a.isDefault) && user.addresses.length) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("DELETE ADDRESS ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
