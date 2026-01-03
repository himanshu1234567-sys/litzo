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

  // ✅ Get latest DRAFT cart
  let cart = await Cart.findOne({
    userId: user._id,
    status: "DRAFT",
  });

  // ✅ Create cart if not exists
  if (!cart) {
    cart = await Cart.create({
      userId: user._id,
      items: [],
      bookingDetails: {
        receiverName: user.firstName || "",
        receiverPhone: user.phone,
      },
      bill: {
        subTotal: 0,
        gst: 0,
        discount: 0,
        cleaningFee: 0,
        total: 0,
      },
      status: "DRAFT",
    });
  }

  // ✅ Update booking details
  if (bookingDetails) {
    cart.bookingDetails = {
      ...cart.bookingDetails,
      ...bookingDetails,
    };
  }

  const itemIndex = cart.items.findIndex(
    (i: any) => i.serviceId.toString() === serviceId
  );

 if (action === "ADD") {
  if (itemIndex === -1) {
    const base = service.baseDuration ?? service.durationUnit;

    cart.items.push({
      serviceId: service._id,
      title: service.title,
      description: service.description,
      category: service.category,
      image: service.image,

      price: service.price,
      discountPrice: service.discountPrice,

      unitLabel: service.unitLabel,
      pricePerUnit:
        service.unitLabel === "Minutes"
          ? service.pricePerUnit ?? service.price
          : service.price,

      durationUnit: service.durationUnit,

      baseDuration: base,
      minDuration: base, // 🔐 IMPORTANT

      quantity: 1,

      includes: service.includes,
      excludes: service.excludes,
    });
  } else {
    const item = cart.items[itemIndex];

    if (item.unitLabel === "Minutes") {
      item.baseDuration += item.durationUnit;
    } else {
      item.quantity += 1;
    }
  }
}


// ================= REMOVE =================
// ================= REMOVE =================
if (action === "REMOVE") {
  if (itemIndex === -1) {
    // nothing to remove
  } else {
    const item = cart.items[itemIndex];

    // ⏱️ Minutes-based service
    if (item.unitLabel === "Minutes") {
      const min = item.minDuration; // DB se aaya hua
      const next = item.baseDuration - item.durationUnit;

      // 🔥 REMOVE ITEM if minimum reached
      if (next < min || next === min) {
        cart.items.splice(itemIndex, 1);
      } else {
        item.baseDuration = next;
      }
    }

    // 🔢 Quantity-based service
    else {
      const nextQty = item.quantity - 1;

      if (nextQty <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        item.quantity = nextQty;
      }
    }
  }
}



  // 🔒 HARD CLEANUP (for corrupted carts)
  cart.items = cart.items.filter((item: any) => {
    if (item.unitLabel === "Minutes") {
      return item.baseDuration >= service.baseDuration;
    }
    return item.quantity > 0;
  });

  // ✅ Recalculate bill
  calculateBill(cart);

  // 🔐 Never allow negative totals
  cart.bill.subTotal = Math.max(0, cart.bill.subTotal);
  cart.bill.total = Math.max(0, cart.bill.total);

  await cart.save();

  return NextResponse.json({
    success: true,
    cart,
  });
}
