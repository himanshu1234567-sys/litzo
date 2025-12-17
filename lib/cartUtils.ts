export function calculateBill(cart: any) {
  let subTotal = 0;

  for (const item of cart.items) {
    const basePrice = item.discountPrice ?? item.price;

    // 🔢 Quantity based
    if (item.unitLabel !== "Minutes") {
      subTotal += basePrice * item.quantity;
    }

    // ⏱ Duration based
    if (item.unitLabel === "Minutes") {
      const extraMinutes = item.baseDuration - 30;
      const extraSlots = extraMinutes > 0
        ? extraMinutes / item.durationUnit
        : 0;

      const extraCost = extraSlots * item.pricePerUnit;
      subTotal += basePrice + extraCost;
    }
  }

  const gst = Math.round(subTotal * 0.18);

  cart.bill.subTotal = subTotal;
  cart.bill.gst = gst;
  cart.bill.cleaningFee = 0;
  cart.bill.discount = 0;
  cart.bill.total = subTotal + gst;
}
