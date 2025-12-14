export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Cart } from "@/models/Cart";
import { Service } from "@/models/Service";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { serviceId, quantity = 1 } = await req.json();

    const service = await Service.findById(serviceId);
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: [
          {
            serviceId,
            title: service.title,
            price: service.price,
            quantity,
            image: service.image,   // ✅ FIXED
          },
        ],
      });

      cart.calculateTotal();
      await cart.save();

      return NextResponse.json({ success: true, cart });
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.serviceId.toString() === serviceId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    } else {
      cart.items.push({
        serviceId,
        title: service.title,
        price: service.price,
        quantity,
        image: service.image,   // ✅ FIXED
      });
    }

    cart.calculateTotal();
    await cart.save();

    return NextResponse.json({ success: true, cart });
  } catch (err) {
    console.error("Cart Add Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
