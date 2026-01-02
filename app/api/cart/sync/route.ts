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

  // ✅ STEP 1: find latest DRAFT cart only
  let cart = await Cart.findOne({
    userId: user._id,
    status: "DRAFT",
  });

  // ✅ STEP 2: if no DRAFT cart → create new
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


  // ✅ STEP 3: update booking details (partial)
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
      pricePerUnit: service.pricePerUnit,
      durationUnit: service.durationUnit,

      // ⬇️ MAIN PART
      baseDuration: base,
      minDuration: base,   // 🔐 always stored once

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

    // ⏱️ Duration based service
    if (item.unitLabel === "Minutes") {
      item.baseDuration -= item.durationUnit;

      // remove item if duration goes below minimum
      if (item.baseDuration <= item.minDuration) {
        cart.items.splice(itemIndex, 1);
      }
    }

    // 🔢 Quantity based service
    else {
      item.quantity -= 1;

      // remove item if quantity becomes 0
      if (item.quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }
  }
}



  // ✅ FINAL BILL
  calculateBill(cart);
  await cart.save();

  return NextResponse.json({ success: true, cart });
}
