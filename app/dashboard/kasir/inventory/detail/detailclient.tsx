"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SPWONavbar from "@/components/SPWOsidebar";

interface DetailInventoryProps {
  id: string;
  nama: string;
  kategori: string;
  hargaModal: number; // ✅ PASTIKAN field ini ADA
  tanggalUpdate: string;
  status: string;
  deskripsi?: string;
  imageUrl?: string;
}

export default function DetailInventoryPage() {
  const router = useRouter();
  const [data, setData] = useState<DetailInventoryProps | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem("inventoryDetail");
    if (!storedData) {
      alert("Data tidak ditemukan! Kembali ke halaman inventory.");
      router.push("/dashboard/inventory");
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      
      // ✅ VALIDASI: Pastikan field required ada
      if (!parsedData.hargaModal) {
        console.error("Data hargaModal tidak ada:", parsedData);
        alert("Data inventory tidak lengkap! Periksa struktur data.");
        router.push("/dashboard/inventory");
        return;
      }

      setData(parsedData);
    } catch (error) {
      console.error("Error parsing data:", error);
      alert("Error loading data inventory!");
      router.push("/dashboard/inventory");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SPWONavbar onLogout={handleLogout} />
        <main className="flex-1 ml-60 p-8 flex items-center justify-center">
          <div className="text-center text-gray-500">Memuat data inventory...</div>
        </main>
      </div>
    );
  }

  // ✅ DATA PASTI ADA - tidak perlu fallback
  const fields = [
    { label: "ID Item", value: data.id },
    { label: "Nama Item", value: data.nama },
    { label: "Kategori", value: data.kategori },
    { label: "Harga Modal", value: `Rp ${data.hargaModal.toLocaleString("id-ID")}` },
    { label: "Tanggal Update", value: data.tanggalUpdate },
    { label: "Status", value: data.status },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <SPWONavbar onLogout={handleLogout} />
      
      <main className="flex-1 ml-60 p-8 overflow-y-auto">
        <motion.div
          className="min-h-full bg-teal-500 p-6 lg:p-8 flex flex-col items-center rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-white font-bold text-3xl mb-8 text-center">
            DETAIL INVENTORY - {data.nama}
          </h1>

          <motion.div
            className="w-full lg:w-[900px] bg-teal-400/80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              {fields.map((field, idx) => (
                <div key={idx} className="text-center">
                  <label className="text-white font-semibold mb-2 block text-lg">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={field.value as string}
                    readOnly
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none bg-white shadow-sm text-gray-800 font-medium text-center"
                  />
                </div>
              ))}
              
              {/* Status Badge */}
              <div className="text-center">
                <label className="text-white font-semibold mb-2 block text-lg">
                  Status Inventory
                </label>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  data.status === "Update" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {data.status}
                </span>
              </div>

              {/* Kategori Badge */}
              <div className="text-center">
                <label className="text-white font-semibold mb-2 block text-lg">
                  Kategori
                </label>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {data.kategori}
                </span>
              </div>

              {/* Deskripsi jika ada */}
              {data.deskripsi && (
                <div className="text-center mt-6 p-4 bg-white/90 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2">Deskripsi Item:</h3>
                  <p className="text-gray-600">{data.deskripsi}</p>
                </div>
              )}
            </div>
          </motion.div>

          <button
            onClick={() => router.push("/dashboard/inventory")}
            className="mt-8 bg-red-600 text-white px-8 py-3 rounded-xl shadow hover:bg-red-700 transition"
          >
            BACK
          </button>
        </motion.div>
      </main>
    </div>
  );
}