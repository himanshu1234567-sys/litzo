// app/api/address/delete/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { addressId } = await req.json();

    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== addressId
    );

    // ensure one default
    if (!user.addresses.some((a: any) => a.isDefault) && user.addresses.length) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ADDRESS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
