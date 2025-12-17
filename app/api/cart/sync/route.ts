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

  // 🔹 FETCH SERVICE
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

  // 🔹 UPDATE BOOKING DETAILS (PARTIAL)
  if (bookingDetails) {
    cart.bookingDetails = {
      ...cart.bookingDetails,
      ...bookingDetails,
    };
  }

  const itemIndex = cart.items.findIndex(
    (i: any) => i.serviceId.toString() === serviceId
  );

  // ===================== ADD =====================
  if (action === "ADD") {
    if (itemIndex === -1) {
      // 🆕 FIRST TIME ADD
      cart.items.push({
        serviceId: service._id,
        title: service.title,
        description: service.description,
        category: service.category,
        image: service.image,

        price: service.price,
        discountPrice: service.discountPrice,

        unitLabel: service.unitLabel,
        pricePerUnit: service.pricePerUnit || 0,
        durationUnit: service.durationUnit || 0,

        baseDuration:
          service.unitLabel === "Minutes"
            ? service.baseDuration || 30
            : null,

        quantity: service.unitLabel === "Minutes" ? 0 : 1,

        includes: service.includes || [],
        excludes: service.excludes || [],
      });
    } else {
      const item = cart.items[itemIndex];

      // 🔢 Quantity based
      if (item.unitLabel !== "Minutes") {
        item.quantity += 1;
      }

      // ⏱ Duration based
      if (item.unitLabel === "Minutes") {
        item.baseDuration =
          (item.baseDuration || 30) + item.durationUnit;
      }
    }
  }

  // ===================== REMOVE =====================
  if (action === "REMOVE" && itemIndex !== -1) {
    const item = cart.items[itemIndex];

    if (item.unitLabel === "Minutes") {
      item.baseDuration -= item.durationUnit;

      // ❌ Remove if below minimum
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

  return NextResponse.json({
    success: true,
    cart,
  });
}
