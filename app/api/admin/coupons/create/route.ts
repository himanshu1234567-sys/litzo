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

    // ✅ READ BODY ONCE
    const body = await req.json();

    const {
      code,
      type,
      value,
      expiryDate,
      minOrderAmount
    } = body;

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
      minBillAmount: Number(minOrderAmount ?? 0),
      expiryDate
    });

    // ✅ RESPONSE RETURNS minBillAmount
    return NextResponse.json({
      success: true,
      coupon
    });

  } catch (err: any) {
    console.error("COUPON CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
