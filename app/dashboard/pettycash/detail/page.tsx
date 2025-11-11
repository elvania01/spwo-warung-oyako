"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DetailPettyCashProps {
  id: number;
  nama: string;
  jumlah: number;
  harga: number;
  kategori: string;
  gambarUrl: string;
  tanggal: string;
}

export default function DetailPettyCashPage() {
  const router = useRouter();
  const [data, setData] = useState<DetailPettyCashProps | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("pettyCashDetail");
    if (!storedData) {
      router.back();
    } else {
      setData(JSON.parse(storedData));
    }
  }, [router]);

  if (!data) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <motion.div
      className="min-h-screen bg-teal-500 p-6 lg:p-12 flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-white font-bold text-3xl mb-10 text-center">
        Detail Petty Cash
      </h1>

      <motion.div
        className="w-full lg:w-[900px] flex flex-col lg:flex-row gap-8 bg-teal-400/80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Kolom kiri (detail) */}
        <div className="flex-1 space-y-6">
          {([
            { label: "ID Produk", value: data.id },
            { label: "Nama Produk", value: data.nama },
            { label: "Jumlah", value: data.jumlah },
            { label: "Harga", value: `Rp${data.harga.toLocaleString("id-ID")}` },
            { label: "Kategori", value: data.kategori },
            {
              label: "Tanggal Pembelian",
              value: new Date(data.tanggal).toLocaleDateString("id-ID"),
            },
          ] as const).map((field, idx) => (
            <div key={idx}>
              <label className="text-red-600 font-semibold mb-1 block">
                {field.label}
              </label>
              <input
                type="text"
                value={field.value as string | number}
                readOnly
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none bg-white shadow-sm"
              />
            </div>
          ))}
        </div>

        {/* Kolom kanan (gambar) */}
        <div className="flex-1 flex justify-center items-center">
          <motion.img
            src={data.gambarUrl}
            alt={data.nama}
            className="max-w-full rounded-2xl shadow-lg object-contain"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Tombol BACK */}
      <button
        onClick={() => router.back()}
        className="mt-8 lg:mt-6 bg-red-600 text-white px-8 py-3 rounded-xl shadow hover:bg-red-700 transition"
      >
        BACK
      </button>
    </motion.div>
  );
}
