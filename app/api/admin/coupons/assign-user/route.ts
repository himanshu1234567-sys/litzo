import "@/models"; // 👈 VERY IMPORTANT
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { UserCoupon } from "@/models/UserCoupon";

export async function POST(req: Request) {
  await connectDB();

  const { couponId, userId } = await req.json();

  if (!couponId || !userId) {
    return NextResponse.json(
      { error: "couponId & userId required" },
      { status: 400 }
    );
  }

  await UserCoupon.findOneAndUpdate(
    { couponId, userId },
    { couponId, userId, isUsed: false },
    { upsert: true, new: true }
  );

  return NextResponse.json({
    success: true,
    message: "Coupon assigned to user",
  });
}
