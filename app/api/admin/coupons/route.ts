import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export async function GET() {
  await connectDB();

  const coupons = await Coupon.find().sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    coupons,
  });
}
