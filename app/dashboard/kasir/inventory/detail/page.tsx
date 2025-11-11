'use client';

import { useParams, useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";

interface Item {
  id: string;
  nama: string;
  kategori: "Makanan" | "Minuman" | "Bahan Pokok";
  tanggalUpdate: string;
  hargaModal: number;
  status: "Update" | "Belum Update";
  pettyCashId: string | null;
  deskripsi?: string;
  imageUrl?: string;
}

const dataInventory: Item[] = [
  { id: "ITM001", nama: "Es Batu", kategori: "Minuman", tanggalUpdate: "03-11-2025", hargaModal: 3000, status: "Update", pettyCashId: "PC001", deskripsi: "Es batu untuk minuman dingin", imageUrl: "/images/esbatu.jpg" },
  { id: "ITM002", nama: "Gula Pasir", kategori: "Bahan Pokok", tanggalUpdate: "02-11-2025", hargaModal: 14000, status: "Update", pettyCashId: "PC002", deskripsi: "Gula pasir kualitas premium", imageUrl: "/images/gulapasir.jpg" },
  { id: "ITM003", nama: "Garam", kategori: "Bahan Pokok", tanggalUpdate: "01-11-2025", hargaModal: 4500, status: "Belum Update", pettyCashId: null, deskripsi: "Garam dapur halus", imageUrl: "/images/garam.jpg" },
];

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const item = dataInventory.find(it => it.id === id);

  const getStatusColor = (status: Item["status"]) => {
    switch (status) {
      case "Update": return "bg-green-100 text-green-800";
      case "Belum Update": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // 🔹 Jika item null, tampilkan pesan
  if (!item) {
    return (
      <div className="flex h-screen w-full">
        <SPWONavbar onLogout={() => { localStorage.removeItem("isLoggedIn"); router.push("/"); }} />
        <main className="flex-1 ml-64 flex items-center justify-center text-gray-500">
          Item tidak ditemukan.
        </main>
      </div>
    );
  }

  // 🔹 Setelah ini, TypeScript yakin item pasti ada
  return (
    <div className="flex h-screen w-full bg-gray-100">
      <SPWONavbar onLogout={() => { localStorage.removeItem("isLoggedIn"); router.push("/"); }} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <button onClick={() => router.back()} className="mb-4 text-sm text-emerald-600 hover:text-emerald-800">
          &larr; Kembali
        </button>

        <div className="bg-white shadow rounded-lg max-w-xl mx-auto overflow-hidden">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.nama} className="w-full h-60 object-cover" />
          )}
          <div className="p-6 space-y-3">
            <h1 className="text-2xl font-bold">{item.nama}</h1>
            <p className="text-gray-500">{item.kategori} • Update: {item.tanggalUpdate}</p>
            <p className="text-gray-700">
              Harga Modal: <span className="font-medium">Rp {item.hargaModal.toLocaleString("id-ID")}</span>
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
            <p className="text-gray-600">{item.deskripsi || "Tidak ada deskripsi tersedia."}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
