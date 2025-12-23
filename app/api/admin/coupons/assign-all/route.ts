import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { User } from "@/models/User";
import { UserCoupon } from "@/models/UserCoupon";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 ADMIN AUTH
    const admin = await getUserFromToken(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { couponCode } = await req.json();
    if (!couponCode) {
      return NextResponse.json(
        { error: "couponCode required" },
        { status: 400 }
      );
    }

    // 🎟️ FIND COUPON
    const coupon = await Coupon.findOne({
      code: couponCode,
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found or inactive" },
        { status: 404 }
      );
    }

    // 👥 GET ALL USERS
    const users = await User.find({ role: "user" }).select("_id");

    if (!users.length) {
      return NextResponse.json({
        success: true,
        message: "No users found",
        assigned: 0,
      });
    }

    // 🧠 CREATE USER COUPONS (AVOID DUPLICATES)
    const bulkOps = users.map((u) => ({
      updateOne: {
        filter: {
          userId: u._id,
          couponId: coupon._id,
        },
        update: {
          $setOnInsert: {
            userId: u._id,
            couponId: coupon._id,
            isUsed: false,
          },
        },
        upsert: true,
      },
    }));

    const result = await UserCoupon.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: "Coupon assigned to all users",
      assigned: result.upsertedCount,
    });
  } catch (err: any) {
    console.error("ASSIGN ALL COUPON ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
