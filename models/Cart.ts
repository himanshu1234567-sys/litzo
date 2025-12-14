import mongoose, { Schema, model, models } from "mongoose";

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
        title: String,
        price: Number,
        quantity: { type: Number, default: 1 }
      }
    ],
    total: { type: Number, default: 0 }
  },
  { timestamps: true }
);

CartSchema.methods.calculateTotal = function () {
  this.total = this.items.reduce((sum: number, item: any) => {
    return sum + item.price * item.quantity;
  }, 0);
};

export const Cart = models.Cart || model("Cart", CartSchema);
