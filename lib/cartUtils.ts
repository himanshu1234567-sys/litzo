// lib/cartUtils.ts
export function calculateBill(cart: any) {

  if (!cart.bill) {
    cart.bill = {};
  }

  let subTotal = 0;

  for (const item of cart.items) {
    const price = item.discountPrice ?? item.price;

    // 🟢 Duration-Based Service
    if (item.unitLabel === "Minutes") {
      const units = item.baseDuration / item.durationUnit;
      subTotal += units * item.pricePerUnit;
    }

    // 🟢 Quantity-Based Service
    else {
      subTotal += price * item.quantity;
    }
  }

  const gst = Math.round(subTotal * 0.18);

  cart.bill.subTotal = subTotal;
  cart.bill.gst = gst;
  cart.bill.cleaningFee = 0;
  cart.bill.discount = 0;
  cart.bill.total = subTotal + gst;
}
