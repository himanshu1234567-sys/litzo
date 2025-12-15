import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Service } from "@/models/Service";
import { getUserFromToken } from "@/lib/auth";
import { calculateBill } from "@/lib/cartUtils";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 AUTH
    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { serviceId, action, bookingDetails } = await req.json();

    let cart = await Cart.findOne({
      userId: user._id,
      status: "DRAFT",
    });

    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: [],
        bookingDetails: {},
        bill: {},
        status: "DRAFT",
      });
    }

    // -------------------------
    // 🔁 UPDATE BOOKING DETAILS
    // -------------------------
    if (action === "UPDATE_BOOKING") {
      cart.bookingDetails = {
        ...cart.bookingDetails,
        ...bookingDetails,
      };

      await cart.save();
      return NextResponse.json({ success: true, cart });
    }

    // -------------------------
    // 🧾 SERVICE OPERATIONS
    // -------------------------
    const service = await Service.findById(serviceId);
    if (!service)
      return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const index = cart.items.findIndex(
      (i:any) => i.serviceId.toString() === serviceId
    );

    // ➕ ADD
    if (action === "ADD") {
      if (index === -1) {
        // FIRST TIME ADD
        cart.items.push({
          serviceId: service._id,
          title: service.title,
          description: service.description,
          category: service.category,
          image: service.image,

          price: service.price,
          discountPrice: service.discountPrice,

          unitLabel: service.unitLabel,
          quantity: service.baseDuration ?? 1,
          durationUnit: service.durationUnit,

          includes: service.includes,
          excludes: service.excludes,
        });
      } else {
        // INCREMENT
        const item = cart.items[index];

        if (service.baseDuration) {
          item.quantity += service.durationUnit;
        } else {
          item.quantity += 1;
        }
      }
    }

    // ➖ REMOVE
    // ➖ REMOVE (DECREMENT)
if (action === "REMOVE" && index > -1) {
  const item = cart.items[index];

  if (service.baseDuration) {
    // ⏱ Duration based service
    item.quantity -= service.durationUnit;

    // ❌ Remove item if below base duration
    if (item.quantity < service.baseDuration) {
      cart.items.splice(index, 1);
    }
  } else {
    // 📦 Quantity based service
    item.quantity -= 1;

    // ❌ Remove item if zero
    if (item.quantity <= 0) {
      cart.items.splice(index, 1);
    }
  }
}


    // 🧮 CALCULATE BILL
    calculateBill(cart);

    // 📝 SAVE
    await cart.save();

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (err) {
    console.error("CART SYNC ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
