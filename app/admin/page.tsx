import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { User } from "@/models/User"
import { Booking } from "@/models/Booking"
import { Service } from "@/models/Service"
import { AdminHeader } from "@/components/admin-header"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const decoded: any = verifyToken(token);

  if (!decoded || decoded.role !== "admin") {
    redirect("/admin/login");
  }

  await connectDB();

  const [users, bookings, services] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Booking.find().populate("serviceId").populate("userId").lean(),
    Service.find().lean(),
  ]);

  const totalRevenue = bookings.reduce((sum, booking: any) => sum + booking.paidAmount, 0);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard
          stats={{
            users,
            bookings: bookings.length,
            revenue: totalRevenue,
            services: services.length,
          }}
          recentBookings={JSON.parse(JSON.stringify(bookings.slice(0, 5)))}
        />
      </main>
    </div>
  );
}
