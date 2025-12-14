import { Schema, model, models } from "mongoose"

export interface IEmployee {
  _id: string
  name: string
  email: string
  phone: string
  specialization: string[]
  isAvailable: boolean
  rating: number
  completedBookings: number
  createdAt: Date
  updatedAt: Date
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    specialization: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 5 },
    completedBookings: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Employee = models.Employee || model<IEmployee>("Employee", EmployeeSchema)
