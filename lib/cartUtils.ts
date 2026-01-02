export function calculateBill(cart: any) {
  if (!cart.bill) cart.bill = {};

  let subTotal = 0;

  for (const item of cart.items) {

    // ⏱️ Minutes-based service
    if (item.unitLabel === "Minutes") {
      const duration = Math.max(0, Number(item.baseDuration));
      const unit = Number(item.durationUnit);
      const pricePerUnit = Number(
        item.pricePerUnit ?? item.discountPrice ?? item.price
      );

      if (!duration || !unit || !pricePerUnit) continue;

      const units = duration / unit;
      subTotal += units * pricePerUnit;
    }

    // 🔢 Quantity-based service
    else {
      const price = Number(item.discountPrice ?? item.price);
      const qty = Math.max(0, Number(item.quantity ?? 1));

      subTotal += price * qty;
    }
  }

  subTotal = Math.max(0, subTotal); // 🔐 never negative

  const gst = Math.round(subTotal * 0.18);

  cart.bill.subTotal = subTotal;
  cart.bill.gst = gst;

  cart.bill.cleaningFee = cart.bill.cleaningFee ?? 0;
  cart.bill.cleaningKitFee = cart.bill.cleaningKitFee ?? 0;
  cart.bill.discount = Math.min(
    cart.bill.discount ?? 0,
    subTotal
  );

  cart.bill.total = Math.max(
    0,
    subTotal +
      gst +
      cart.bill.cleaningFee +
      cart.bill.cleaningKitFee -
      cart.bill.discount
  );
}
