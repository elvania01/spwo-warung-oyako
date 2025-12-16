"use client";

import { useSearchParams, useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";
import { Download, ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

// Fungsi generate ID Laporan unik
const generateIdLaporan = () => `LP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export default function DetailLaporanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data dari contoh laporan (jika tidak ada dari parameter, gunakan data contoh)
  const namaProduk = searchParams.get("nama") || "Es Batu";
  const produk = searchParams.get("produk") || "NAH47E";
  const idTransaksi = searchParams.get("idTransaksi") || "12";
  const jumlah = parseInt(searchParams.get("jumlah") || "1");
  const harga = parseInt(searchParams.get("harga") || "20000");
  const tanggalRaw = searchParams.get("tanggal") || "2025-10-01";
  const total = jumlah * harga;

  // Generate ID Laporan unik
  const idLaporan = generateIdLaporan();

  // Format tanggal dengan validasi
  const tanggalObj = new Date(tanggalRaw);
  const tanggalFormatted =
    tanggalRaw && !isNaN(tanggalObj.getTime())
      ? tanggalObj.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
      : "1 Oktober 2025"; // Fallback ke tanggal contoh

  // Format tanggal untuk tabel (format DD-MM-YYYY)
  const tanggalTabel = tanggalRaw && !isNaN(tanggalObj.getTime())
    ? tanggalObj.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "01-10-2025";

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  // Download CSV
  const handleDownloadDetail = () => {
    const csv = [
      ["Detail Laporan Petty Cash - Warung Oyako"],
      [""],
      ["Tanggal Pembelian", tanggalFormatted],
      ["ID Laporan", idLaporan],
      [""],
      ["Nama", "Produk", "ID Transaksi", "Jumlah", "Harga", "Tanggal", "Total (Rp)"],
      [namaProduk, produk, idTransaksi, jumlah, `Rp. ${harga.toLocaleString("id-ID")}`, tanggalTabel, `Rp. ${total.toLocaleString("id-ID")}`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-petty-cash-${idLaporan}.csv`;
    link.click();
  };

  // Format mata uang Rupiah
  const formatRupiah = (angka: number) => {
    return `Rp. ${angka.toLocaleString("id-ID")}`;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <SPWONavbar onLogout={handleLogout} />

      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Tombol kembali */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-900 transition hover:bg-emerald-50 px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Laporan
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Detail Laporan Petty Cash
                </h1>
              </div>
              <p className="text-gray-600">Laporan pengeluaran kas kecil Warung Oyako</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadDetail}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition flex items-center gap-3 font-medium"
            >
              <Download className="w-5 h-5" />
              Unduh CSV
            </motion.button>
          </div>

          {/* Kartu utama */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header Card dengan info tanggal dan ID */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 md:px-10 py-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <p className="text-lg font-semibold opacity-90">Tanggal Pembelian</p>
                  <p className="text-2xl font-bold">{tanggalFormatted}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold opacity-90">ID Laporan</p>
                  <p className="text-2xl font-bold">{idLaporan}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <p className="text-sm font-medium">Total Pengeluaran</p>
                  <p className="text-2xl font-bold mt-1">{formatRupiah(total)}</p>
                </div>
              </div>
            </div>

            {/* Tabel detail */}
            <div className="p-4 md:p-8 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-gray-100 text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Produk</th>
                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-right">Total (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-emerald-50/50 transition duration-150 border-b">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{namaProduk}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {produk}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{idTransaksi}</td>
                    <td className="px-6 py-4">
                      <div className="inline-block bg-gray-100 px-3 py-1 rounded-md font-medium">
                        {jumlah}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatRupiah(harga)}</td>
                    <td className="px-6 py-4">{tanggalTabel}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-lg text-emerald-700">
                        {formatRupiah(total)}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              {/* Summary box */}
              <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Ringkasan Transaksi</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Detail transaksi telah dicatat dalam sistem petty cash Warung Oyako
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Total Pembayaran</p>
                    <p className="text-3xl font-bold text-emerald-700 mt-1">{formatRupiah(total)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer card */}
            <div className="bg-gray-50 border-t px-8 py-6 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-600 text-sm mb-4 md:mb-0">
                <p className="font-medium">Informasi Laporan</p>
                <p>Laporan ini dibuat secara otomatis oleh sistem Warung Oyako</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownloadDetail}
                  className="bg-white border border-emerald-500 text-emerald-600 px-5 py-2 rounded-lg hover:bg-emerald-50 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Unduh Detail
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                  Cetak Laporan
                </button>
              </div>
            </div>
          </motion.div>

          {/* Informasi tambahan */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Catatan Penting</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <span>Laporan petty cash ini mencatat pengeluaran kas kecil untuk kebutuhan operasional harian</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <span>Pastikan semua transaksi petty cash didukung dengan bukti pembelian yang valid</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <span>ID laporan bersifat unik dan dapat digunakan untuk referensi pencarian data</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
}