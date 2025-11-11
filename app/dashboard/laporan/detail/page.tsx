"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";
import { Download, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface LaporanItem {
  id_transaksi: string;
  nama: string;
  jumlah: number;
  harga: number;
  tanggal: string;
}

export default function DetailLaporanPage() {
  const router = useRouter();
  const params = useParams();
  const idLaporan = params.idLaporan;

  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  // 🔹 Fetch data dari API Neon
  useEffect(() => {
    if (!idLaporan) {
      router.replace("/dashboard/laporan");
      return;
    }

    const fetchDetailLaporan = async () => {
      try {
        const res = await fetch(`/api/laporan/${idLaporan}`);
        if (!res.ok) throw new Error("Data laporan tidak ditemukan");

        const data: LaporanItem[] = await res.json();
        setLaporan(data);
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil data laporan!");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchDetailLaporan();
  }, [idLaporan, router]);

  // 🔹 Hitung total pengeluaran
  const totalPengeluaran = useMemo(
    () => laporan.reduce((sum, item) => sum + item.harga * item.jumlah, 0),
    [laporan]
  );

  // 🔹 Download CSV
  const downloadCSV = (rows: string[][], filename: string) => {
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleDownloadDetail = () => {
    const rows = [
      ["ID Transaksi", "Nama Produk", "Jumlah", "Harga (Rp)", "Tanggal", "Total (Rp)"],
      ...laporan.map((i) => [
        i.id_transaksi,
        i.nama,
        i.jumlah.toString(),
        i.harga.toString(),
        i.tanggal,
        (i.jumlah * i.harga).toString(),
      ]),
    ];
    downloadCSV(rows, `laporan-detail-${idLaporan}.csv`);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="w-48 h-6 bg-gray-300 rounded mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <p className="mt-4 text-gray-500">Loading laporan...</p>
      </div>
    );

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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-900 transition"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali ke Laporan
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
              Detail Laporan Petty Cash <br />
              <span className="text-emerald-600">Warung Oyako</span>
            </h1>
            <button
              onClick={handleDownloadDetail}
              className="bg-emerald-600 text-white px-5 py-3 rounded-xl shadow hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> Unduh Detail (CSV)
            </button>
          </div>

          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-6 rounded-2xl shadow-lg max-w-md"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-lg font-semibold opacity-90">Total Pengeluaran</p>
            <p className="text-4xl font-extrabold mt-2">
              Rp {totalPengeluaran.toLocaleString("id-ID")}
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ID Transaksi</th>
                    <th className="px-6 py-3 font-semibold">Nama Produk</th>
                    <th className="px-6 py-3 font-semibold">Jumlah</th>
                    <th className="px-6 py-3 font-semibold">Harga (Rp)</th>
                    <th className="px-6 py-3 font-semibold">Tanggal</th>
                    <th className="px-6 py-3 font-semibold text-right">Total (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.map((i, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3">{i.id_transaksi}</td>
                      <td className="px-6 py-3">{i.nama}</td>
                      <td className="px-6 py-3">{i.jumlah}</td>
                      <td className="px-6 py-3">{i.harga.toLocaleString("id-ID")}</td>
                      <td className="px-6 py-3">{i.tanggal}</td>
                      <td className="px-6 py-3 text-right font-semibold text-emerald-700">
                        {(i.jumlah * i.harga).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
