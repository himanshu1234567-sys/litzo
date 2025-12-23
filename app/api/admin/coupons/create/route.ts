import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const admin = await getUserFromToken(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 401 });
    }

    const { code, type, value, minBillAmount, expiryDate } = await req.json();

    if (!code || !type || !value || !expiryDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      minBillAmount: minBillAmount || 0,
      expiryDate
    });

    return NextResponse.json({ success: true, coupon });

  } catch (err: any) {
    console.error("COUPON CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
