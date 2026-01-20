import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { User } from "@/models/User";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { UserCoupon } from "@/models/UserCoupon";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ OPTIONAL: clean related data
    await Cart.deleteMany({ userId: user._id });
    await Order.deleteMany({ userId: user._id });
    await UserCoupon.deleteMany({ userId: user._id });

    // ✅ delete user
    await User.deleteOne({ _id: user._id });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
