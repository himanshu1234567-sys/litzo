import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Service } from "@/models/Service";
import { getUserFromToken } from "@/lib/auth";
import { calculateBill } from "@/lib/cartUtils";

export async function POST(req: Request) {
  await connectDB();

  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { serviceId, action, bookingDetails } = await req.json();

  if (!serviceId || !action) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // 🔹 Get service from DB (VERY IMPORTANT)
  const service = await Service.findById(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

let cart = await Cart.findOne({ userId: user._id });

  // 🆕 CREATE CART IF NOT EXISTS
  if (!cart) {
    cart = await Cart.create({
      userId: user._id,
      items: [],
      bookingDetails: {
        receiverName: `${user.firstName || ""}`.trim(),
        receiverPhone: user.phone,
      },
      status: "DRAFT",
    });
  }
  // 🔹 Update booking details (partial allowed)
  if (bookingDetails) {
    cart.bookingDetails = {
      ...cart.bookingDetails,
      ...bookingDetails,
    };
  }

  const itemIndex = cart.items.findIndex(
    (i: any) => i.serviceId.toString() === serviceId
  );

  // ================= ADD =================
  if (action === "ADD") {
    if (itemIndex === -1) {
      // 🆕 First time add
      cart.items.push({
        serviceId: service._id,
        title: service.title,
        description: service.description,
        category: service.category,
        image: service.image,
        price: service.price,
        discountPrice: service.discountPrice,
        unitLabel: service.unitLabel,
        pricePerUnit: service.pricePerUnit,
        durationUnit: service.durationUnit,
        baseDuration:
          service.unitLabel === "Minutes" ? 30 : service.baseDuration ?? null,
        quantity: service.unitLabel === "Minutes" ? 0 : 1,
        includes: service.includes,
        excludes: service.excludes,
      });
    } else {
      const item = cart.items[itemIndex];

      // 🔁 Quantity based
      if (item.unitLabel !== "Minutes") {
        item.quantity += 1;
      }

      // ⏱ Duration based
      if (item.unitLabel === "Minutes") {
        item.baseDuration += item.durationUnit; // +15 every hit
      }
    }
  }

  // ================= REMOVE =================
  if (action === "REMOVE" && itemIndex !== -1) {
    const item = cart.items[itemIndex];

    if (item.unitLabel === "Minutes") {
      item.baseDuration -= item.durationUnit;

      if (item.baseDuration < 30) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      item.quantity -= 1;

      if (item.quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }
  }

  // 🔢 FINAL BILL
  calculateBill(cart);

  await cart.save();

  return NextResponse.json({ success: true, cart });
}
