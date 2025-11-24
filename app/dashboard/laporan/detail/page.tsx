"use client";

import { useSearchParams, useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";
import { Download, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// Fungsi generate ID Laporan unik
const generateIdLaporan = () => `LP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export default function DetailLaporanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil data dari URL parameter
  const idTransaksi = searchParams.get("idTransaksi") || "N/A";
  const jumlah = parseInt(searchParams.get("jumlah") || "0");
  const harga = parseInt(searchParams.get("harga") || "0");
  const tanggalRaw = searchParams.get("tanggal") || "";
  const total = jumlah * harga;

  // Generate ID Laporan unik
  const idLaporan = generateIdLaporan();

  // Format tanggal dengan validasi
  const tanggalObj = new Date(tanggalRaw);
  const tanggalFormatted =
    tanggalRaw && !isNaN(tanggalObj.getTime())
      ? tanggalObj.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
      : tanggalRaw || "Tanggal tidak valid";

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  // Download CSV
  const handleDownloadDetail = () => {
    if (idTransaksi === "N/A") {
      alert("Data laporan tidak lengkap untuk diunduh.");
      return;
    }

    const csv = [
      ["ID Laporan", "ID Transaksi", "Jumlah", "Harga (Rp)", "Tanggal Pembelian", "Total (Rp)"],
      [idLaporan, idTransaksi, jumlah, harga, tanggalFormatted, total],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-detail-${tanggalFormatted.replace(/ /g, "-")}.csv`;
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <SPWONavbar onLogout={handleLogout} />

      <main className="flex-1 p-8 md:p-10 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto space-y-10"
        >
          {/* Tombol kembali */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Laporan
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
              Detail Laporan Petty Cash <br />
              <span className="text-emerald-600">Warung Oyako</span>
            </h1>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadDetail}
              className="bg-emerald-600 text-white px-5 py-3 rounded-xl shadow hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Unduh Detail (CSV)
            </motion.button>
          </div>

          {/* Kartu ringkasan */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-lg font-semibold opacity-90">Tanggal Pembelian</p>
                <p className="text-xl font-bold">{tanggalFormatted}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-lg font-semibold opacity-90">ID Laporan</p>
                <p className="text-xl font-bold">{idLaporan}</p>
              </div>
            </div>

            {/* Tabel detail */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ID Transaksi</th>
                    <th className="px-6 py-3 font-semibold">Jumlah</th>
                    <th className="px-6 py-3 font-semibold">Harga (Rp)</th>
                    <th className="px-6 py-3 font-semibold">Tanggal</th>
                    <th className="px-6 py-3 font-semibold text-right">Total (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">{idTransaksi}</td>
                    <td className="px-6 py-3">{jumlah}</td>
                    <td className="px-6 py-3">Rp {harga.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-3">{tanggalFormatted}</td>
                    <td className="px-6 py-3 text-right font-semibold text-emerald-700">
                      Rp {total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer total */}
            <div className="bg-gray-50 border-t px-8 py-6 flex justify-between items-center">
              <p className="text-gray-600 font-medium">Total Pengeluaran</p>
              <p className="text-2xl font-extrabold text-emerald-700">
                Rp {total.toLocaleString("id-ID")}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
