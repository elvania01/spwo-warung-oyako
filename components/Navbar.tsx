"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setRole(JSON.parse(user).role);
  }, []);

  return (
    <nav className="bg-white shadow px-6 py-3 flex gap-6">
      <Link href="/dashboard">Dashboard</Link>

      <Link href="/dashboard/pettycash">Petty Cash</Link>

      {role === "owner" && (
        <Link href="/dashboard/laporan">Laporan</Link>
      )}
    </nav>
  );
}
