"use client";

import DashboardSidebar from "@/components/SPWOsidebar";
import { useRouter } from "next/navigation";

export default function LaporanPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/autentikasi/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar onLogout={handleLogout} activePage="dashboard" />

      <main className="flex-1 ml-60 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Laporan Keuangan</h2>
        <div className="bg-white shadow rounded-xl p-6 text-gray-700">
          <p>
            Halaman ini menampilkan laporan keuangan bulanan dan detail transaksi petty cash.
          </p>
        </div>
      </main>
    </div>
  );
}
