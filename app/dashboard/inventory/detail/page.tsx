'use client';

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";
import SPWONavbar from "@/components/SPWOsidebar";

interface Item {
  id: string;
  nama: string;
  kategori: "Makanan" | "Minuman" | "Bahan Pokok";
  tanggalUpdate: string;
  hargaModal: number;
  status: "Update" | "Belum Update";
  pettyCashId?: string | null;
  deskripsi?: string;
  imageUrl?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Fetch data dari API tanpa /[id]
  useEffect(() => {
    const stored = sessionStorage.getItem("inventoryDetail");
    if (stored) setSelected(JSON.parse(stored));

    const fetchData = async () => {
      try {
        const res = await fetch("/api/inventory");
        if (!res.ok) throw new Error("Gagal memuat data inventory");
        const data: Item[] = await res.json();
        setItems(data);
      } catch {
        setError("Tidak dapat memuat data inventory.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Saat klik Detail
  const handleDetail = (item: Item) => {
    setSelected(item);
    sessionStorage.setItem("inventoryDetail", JSON.stringify(item));
  };

  // 🔹 Kembali ke daftar
  const handleBack = () => {
    setSelected(null);
    sessionStorage.removeItem("inventoryDetail");
  };

  // 🔹 Warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Update": return "bg-green-100 text-green-800";
      case "Belum Update": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // 🔹 Loading / Error
  if (loading)
    return <div className="flex h-screen items-center justify-center text-gray-700">Loading...</div>;
  if (error)
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

  // 🔹 Tampilan utama
  return (
    <div className="flex h-screen w-full bg-gray-100">
      <SPWONavbar
        onLogout={() => {
          localStorage.removeItem("isLoggedIn");
          location.href = "/";
        }}
      />
 
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {!selected ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Daftar Inventory</h1>

            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">ID Item</th>
                    <th className="px-6 py-3">Nama</th>
                    <th className="px-6 py-3">Kategori</th>
                    <th className="px-6 py-3">Tanggal Update</th>
                    <th className="px-6 py-3">Harga Modal</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium">{item.id}</td>
                      <td className="px-6 py-4">{item.nama}</td>
                      <td className="px-6 py-4">{item.kategori}</td>
                      <td className="px-6 py-4">{item.tanggalUpdate}</td>
                      <td className="px-6 py-4">
                        Rp {item.hargaModal.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td
                        onClick={() => handleDetail(item)}
                        className="px-6 py-4 text-emerald-600 hover:text-emerald-800 cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={16} /> Detail
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          // 🔹 Detail tampilan tanpa berpindah halaman
          <motion.div
            className="min-h-screen bg-emerald-500 p-6 lg:p-12 flex flex-col items-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-bold text-3xl mb-10 text-center">
              Detail Inventory
            </h1>

            <motion.div
              className="w-full lg:w-[900px] flex flex-col lg:flex-row gap-8 bg-emerald-400/80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Kiri: informasi */}
              <div className="flex-1 space-y-6">
                {([
                  { label: "ID Item", value: selected.id },
                  { label: "Nama Item", value: selected.nama },
                  { label: "Kategori", value: selected.kategori },
                  { label: "Tanggal Update", value: selected.tanggalUpdate },
                  { label: "Harga Modal", value: `Rp${selected.hargaModal.toLocaleString("id-ID")}` },
                  { label: "Status", value: selected.status },
                ] as const).map((field, idx) => (
                  <div key={idx}>
                    <label className="text-red-700 font-semibold mb-1 block">{field.label}</label>
                    <input
                      type="text"
                      value={field.value}
                      readOnly
                      className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-red-700 font-semibold mb-1 block">Deskripsi</label>
                  <textarea
                    readOnly
                    value={selected.deskripsi || "Tidak ada deskripsi."}
                    className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm"
                  />
                </div>
              </div>

              {/* Kanan: gambar */}
              <div className="flex-1 flex justify-center items-center">
                <motion.img
                  src={selected.imageUrl || "/images/default.jpg"}
                  alt={selected.nama}
                  className="max-w-full rounded-2xl shadow-lg object-contain"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Tombol Back */}
            <button
              onClick={handleBack}
              className="mt-8 bg-red-600 text-white px-8 py-3 rounded-xl shadow hover:bg-red-700 transition"
            >
              BACK
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
