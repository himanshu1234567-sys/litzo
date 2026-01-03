import { NextResponse } from "next/server";
import { Cart } from "@/models/Cart";
import { Service } from "@/models/Service";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { calculateBill } from "@/lib/cartUtils";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, quantity, duration } = await req.json();

    if (!serviceId) {
      return NextResponse.json(
        { error: "serviceId is required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({
      userId: user._id,
      status: "DRAFT",
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (i: any) => i.serviceId.toString() === serviceId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    const item = cart.items[itemIndex];

    // 🔥 MINUTES BASED SERVICE
    if (item.unitLabel === "Minutes") {
      if (!duration || duration < item.minDuration) {
        return NextResponse.json(
          {
            error: `Minimum duration is ${item.minDuration} minutes`,
            minDuration: item.minDuration,
          },
          { status: 400 }
        );
      }

      item.baseDuration = duration;
    }

    // 🔢 QUANTITY BASED SERVICE
    else {
      if (!quantity || quantity < 1) {
        return NextResponse.json(
          { error: "Quantity must be at least 1" },
          { status: 400 }
        );
      }

      item.quantity = quantity;
    }

    // 🔄 Recalculate bill
    calculateBill(cart);
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (err) {
    console.error("Cart Update Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
