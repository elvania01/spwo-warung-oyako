'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SPWONavbar from "@/components/SPWOsidebar";

export interface Item {
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

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch("/api/inventory"); // ambil semua item
        if (!res.ok) throw new Error("Gagal memuat data");
        const data: Item[] = await res.json();
        const found = data.find(it => it.id === id) || null;
        setItem(found);
      } catch (err) {
        setError("Item tidak dapat dimuat.");
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Update": return "bg-green-100 text-green-800";
      case "Belum Update": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  if (error || !item) return (
    <div className="flex h-screen w-full">
      <SPWONavbar onLogout={() => { localStorage.removeItem("isLoggedIn"); router.push("/"); }} />
      <main className="flex-1 ml-64 flex items-center justify-center text-gray-500">
        {error || "Item tidak ditemukan."}
      </main>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <SPWONavbar onLogout={() => { localStorage.removeItem("isLoggedIn"); router.push("/"); }} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <button onClick={() => router.back()} className="mb-4 text-sm text-emerald-600 hover:text-emerald-800">
          &larr; Kembali
        </button>

        <div className="bg-white shadow rounded-lg max-w-xl mx-auto overflow-hidden">
          <img src={item.imageUrl || "/images/default.jpg"} alt={item.nama} className="w-full h-60 object-cover" />
          <div className="p-6 space-y-3">
            <h1 className="text-2xl font-bold">{item.nama}</h1>
            <p className="text-gray-500">{item.kategori} • Update: {item.tanggalUpdate}</p>
            <p className="text-gray-700">Harga Modal: <span className="font-medium">Rp {item.hargaModal.toLocaleString("id-ID")}</span></p>
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
