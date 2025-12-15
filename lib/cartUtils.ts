// lib/cartUtils.ts

export function calculateBill(cart: any) {
  let subTotal = 0;

  for (const item of cart.items) {
    const effectivePrice = item.discountPrice ?? item.price;
    subTotal += effectivePrice * item.quantity;
  }

  const cleaningFee = 0;
  const gst = Math.round(subTotal * 0.18);
  const discount = 0;

  cart.bill.subTotal = subTotal;
  cart.bill.cleaningFee = cleaningFee;
  cart.bill.gst = gst;
  cart.bill.discount = discount;
  cart.bill.total = subTotal + cleaningFee + gst - discount;
}
