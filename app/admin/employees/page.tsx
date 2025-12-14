"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminEmployeesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");

    if (!token) {
      router.replace("/admin/login");
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Employees</h1>
      <p>Employees list will load here...</p>
    </div>
  );
}
