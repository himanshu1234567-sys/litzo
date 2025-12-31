import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    // 🔐 Extract token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // ✅ verifyAdminToken expects STRING
    const admin = verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ await params (Next.js 16 fix)
    const { userId } = await params;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("ADMIN USER ORDERS ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
