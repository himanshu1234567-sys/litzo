import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔐 ADMIN AUTH
    const admin = await getUserFromToken(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 📅 TODAY RANGE
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 👥 USERS
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    // 📦 ORDERS
    const totalOrders = await Order.countDocuments();

    // ⏳ PENDING ORDERS
    const pendingOrders = await Order.countDocuments({
      orderStatus: "CREATED",
    });

    // ❌ FAILED PAYMENTS
    const failedPayments = await Order.countDocuments({
      paymentStatus: "FAILED",
    });

    // 📅 TODAY ORDERS
    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    // 💰 TOTAL REVENUE (SUCCESS ONLY)
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "SUCCESS",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$bill.total" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        failedPayments,
        todayOrders,
      },
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
