export function calculateBill(cart: any) {
  let subTotal = 0;

  for (const item of cart.items) {
    const basePrice = item.discountPrice ?? item.price;

    // Quantity based
    if (item.unitLabel) {
      subTotal += basePrice * item.quantity;
    }

    // Duration based
    if (item.baseDuration && item.durationUnit) {
      const extraSlots =
        (item.baseDuration - 30) / item.durationUnit;

      const extraCost =
        extraSlots > 0 ? extraSlots * item.pricePerUnit : 0;

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
