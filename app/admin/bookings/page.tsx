import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Booking } from "@/models/Booking"
import { Employee } from "@/models/Employee"
import { AdminHeader } from "@/components/admin-header"
import { AdminBookings } from "@/components/admin-bookings"

export default async function AdminBookingsPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/")
  }

  await connectDB()

  const [bookings, employees] = await Promise.all([
    Booking.find().populate("serviceId").populate("userId").populate("employeeId").sort({ createdAt: -1 }).lean(),
    Employee.find({ isAvailable: true }).lean(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <AdminBookings
          bookings={JSON.parse(JSON.stringify(bookings))}
          employees={JSON.parse(JSON.stringify(employees))}
        />
      </main>
    </div>
  )
}
