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

  const service = await Service.findById(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  let cart = await Cart.findOne({ userId: user._id, status: "DRAFT" });
  if (!cart) {
    cart = await Cart.create({
      userId: user._id,
      items: [],
      bookingDetails: {},
      bill: {
        subTotal: 0,
        gst: 0,
        discount: 0,
        cleaningFee: 0,
        total: 0,
      },
       couponApplied: false, 
      status: "DRAFT",
    });
  }

  if (bookingDetails) {
    cart.bookingDetails = { ...cart.bookingDetails, ...bookingDetails };
  }

  const itemIndex = cart.items.findIndex(
    (i: any) => i.serviceId.toString() === serviceId
  );

  const isMinutes = service.unitLabel === "Minutes";
  const hasBaseDuration = typeof service.baseDuration === "number";

  // ================= ADD =================
  if (action === "ADD") {
    if (itemIndex === -1) {
      cart.items.push({
        serviceId: service._id,
        title: service.title,
        description: service.description,
        category: service.category,
        image: service.image,

        unitLabel: service.unitLabel,
        durationUnit: service.durationUnit ?? 1,

        // 🔥 CORE FIX
        baseDuration: isMinutes && hasBaseDuration ? service.baseDuration : undefined,
        minDuration: isMinutes && hasBaseDuration ? service.baseDuration : undefined,

        pricePerUnit:
          isMinutes && hasBaseDuration
            ? service.pricePerUnit ?? service.price
            : service.discountPrice ?? service.price,

        price: service.price,
        discountPrice: service.discountPrice,

        quantity: 1,

        includes: service.includes,
        excludes: service.excludes,
      });
    } else {
      const item = cart.items[itemIndex];

      if (item.unitLabel === "Minutes" && item.baseDuration) {
        item.baseDuration += item.durationUnit;
      } else {
        item.quantity += 1;
      }
    }
  }

  // ================= REMOVE =================
  if (action === "REMOVE" && itemIndex !== -1) {
    const item = cart.items[itemIndex];

    // ⏱️ Duration-based
    if (item.unitLabel === "Minutes" && item.baseDuration) {
      const next = item.baseDuration - item.durationUnit;

      if (next < item.minDuration) {
        cart.items.splice(itemIndex, 1);
      } else {
        item.baseDuration = next;
      }
    }
    // 🔢 Quantity-based (Dusting INCLUDED)
    else {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }
  }

  // ❌ REMOVE THIS (BIGGEST BUG)
  // ❌ cart.items = cart.items.filter(...)

  calculateBill(cart);
  await cart.save();

  return NextResponse.json({ success: true, cart });
}
