"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!data.success) return setError(data.error || "Login failed");

    router.replace("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="p-6 shadow bg-white rounded-xl w-96" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-4 text-cyan-700">Admin Login</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="email"
          className="border p-2 mb-3 w-full"
          placeholder="admin@serviceapp.com"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 mb-3 w-full"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
