// app/api/address/set-default/route.ts
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

    const { addressId } = await req.json();
    if (!addressId)
      return NextResponse.json({ error: "addressId required" }, { status: 400 });

    user.addresses.forEach((addr: any) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SET DEFAULT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
