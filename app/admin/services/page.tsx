// import { redirect } from "next/navigation"
// import { getSession } from "@/lib/auth"
// import connectDB from "@/lib/mongodb"
// import { Service } from "@/models/Service"
// import { AdminHeader } from "@/components/admin-header"
// import { AdminServices } from "@/components/admin-services"

// export default async function AdminServicesPage() {
//   const session = await getSession()

//   if (!session || session.role !== "admin") {
//     redirect("/")
//   }

//   await connectDB()

//   const services = await Service.find().sort({ createdAt: -1 }).lean()

//   return (
//     <div className="min-h-screen bg-background">
//       <AdminHeader />

//       <main className="container mx-auto px-4 py-8">
//         <AdminServices services={JSON.parse(JSON.stringify(services))} />
//       </main>
//     </div>
//   )
// }
