"use client";

import { useSearchParams, useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";
import { Download, ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

// Generate ID laporan unik
const generateIdLaporan = () =>
  `LP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export default function DetailLaporanClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const namaProduk = searchParams.get("nama") ?? "Es Batu";
  const produk = searchParams.get("produk") ?? "NAH47E";
  const idTransaksi = searchParams.get("idTransaksi") ?? "12";
  const jumlah = Number(searchParams.get("jumlah") ?? 1);
  const harga = Number(searchParams.get("harga") ?? 20000);
  const tanggalRaw = searchParams.get("tanggal") ?? "2025-10-01";
  const total = jumlah * harga;

  const idLaporan = generateIdLaporan();

  const tanggalObj = new Date(tanggalRaw);
  const tanggalFormatted = !isNaN(tanggalObj.getTime())
    ? tanggalObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "1 Oktober 2025";

  const tanggalTabel = !isNaN(tanggalObj.getTime())
    ? tanggalObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "01-10-2025";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  const handleDownloadDetail = () => {
    const csv = [
      ["Detail Laporan Petty Cash - Warung Oyako"],
      [""],
      ["Tanggal Pembelian", tanggalFormatted],
      ["ID Laporan", idLaporan],
      [""],
      ["Nama", "Produk", "ID Transaksi", "Jumlah", "Harga", "Tanggal", "Total"],
      [
        namaProduk,
        produk,
        idTransaksi,
        jumlah,
        `Rp ${harga.toLocaleString("id-ID")}`,
        tanggalTabel,
        `Rp ${total.toLocaleString("id-ID")}`,
      ],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-petty-cash-${idLaporan}.csv`;
    link.click();
  };

  const formatRupiah = (value: number) =>
    `Rp ${value.toLocaleString("id-ID")}`;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <SPWONavbar onLogout={handleLogout} />

      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900"
          >
            <ArrowLeft /> Kembali
          </button>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="text-emerald-600" />
              Detail Laporan Petty Cash
            </h1>

            <button
              onClick={handleDownloadDetail}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl flex gap-2"
            >
              <Download /> Unduh CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-8">
              <div className="flex justify-between">
                <div>
                  <p>Tanggal</p>
                  <p className="text-2xl font-bold">{tanggalFormatted}</p>
                </div>
                <div>
                  <p>ID Laporan</p>
                  <p className="text-2xl font-bold">{idLaporan}</p>
                </div>
                <div>
                  <p>Total</p>
                  <p className="text-2xl font-bold">{formatRupiah(total)}</p>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Nama</th>
                    <th className="p-4">Produk</th>
                    <th className="p-4">ID Transaksi</th>
                    <th className="p-4">Jumlah</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-4">{namaProduk}</td>
                    <td className="p-4">{produk}</td>
                    <td className="p-4">{idTransaksi}</td>
                    <td className="p-4">{jumlah}</td>
                    <td className="p-4">{formatRupiah(harga)}</td>
                    <td className="p-4">{tanggalTabel}</td>
                    <td className="p-4 text-right font-bold">
                      {formatRupiah(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
