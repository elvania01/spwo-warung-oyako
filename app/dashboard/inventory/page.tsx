"use client";

import DashboardSidebar from "@/components/SPWOsidebar";
import { useRouter } from "next/navigation";

export default function InventoriPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/autentikasi/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar onLogout={handleLogout} activePage="Inventory" />

      <main className="flex-1 ml-64 p-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Inventory</h2>
        <div className="bg-white shadow rounded-xl p-6 text-gray-700">
          <p>
            Halaman inventori digunakan untuk mengelola stok barang dan peralatan.
          </p>
        </div>
      </main>
    </div>
  );
}
