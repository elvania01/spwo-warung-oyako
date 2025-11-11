"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Download, FileSpreadsheet } from "lucide-react";
import SPWONavbar from "@/components/SPWOsidebar";
import { useRouter } from "next/navigation";

// 🔁 Map singkatan ke nama lengkap
const bulanMapping: Record<string, string> = {
  Jan: "Januari",
  Feb: "Februari",
  Mar: "Maret",
  Apr: "April",
  Mei: "Mei",
  Jun: "Juni",
  Jul: "Juli",
  Agu: "Agustus",
  Sep: "September",
  Okt: "Oktober",
  Nov: "November",
  Des: "Desember",
};

export default function LaporanPage() {
  const [periodeAwal, setPeriodeAwal] = useState("1");
  const [periodeAkhir, setPeriodeAkhir] = useState("31");
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2025");
  const [showCalendar, setShowCalendar] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  // 💾 Data dummy
  const dataLaporan = {
    "1 Okt 2025": [
      { nama: "Es Batu", id: "NAH47E", jumlah: 1, harga: 20000 },
      { nama: "Gula", id: "NAH47E", jumlah: 2, harga: 20000 },
    ],
    "2 Okt 2025": [
      { nama: "Garam", id: "NAH47E", jumlah: 3, harga: 20000 },
      { nama: "Lada", id: "NAH47E", jumlah: 1, harga: 20000 },
    ],
    "1 Sep 2025": [
      { nama: "Tepung", id: "XYZ22", jumlah: 2, harga: 15000 },
      { nama: "Susu", id: "XYZ22", jumlah: 1, harga: 25000 },
    ],
    "3 Nov 2025": [
      { nama: "Minyak", id: "PQR88", jumlah: 2, harga: 25000 },
      { nama: "Kopi", id: "PQR88", jumlah: 1, harga: 20000 },
    ],
  };

  // 🧮 Filter data
  const laporanDalamPeriode = Object.entries(dataLaporan)
    .filter(([tanggal]) => {
      const [tgl, bln, thn] = tanggal.split(" ");
      const namaBulan = bulanMapping[bln] || bln;
      return (
        parseInt(tgl) >= parseInt(periodeAwal) &&
        parseInt(tgl) <= parseInt(periodeAkhir) &&
        `${namaBulan} ${thn}` === selectedMonth
      );
    })
    .map(([tanggal, items]) => ({ tanggal, items }));

  const totalPengeluaran = laporanDalamPeriode.reduce(
    (total, { items }) =>
      total + items.reduce((sum, i) => sum + i.harga * i.jumlah, 0),
    0
  );

  // 📦 Unduh CSV
  const handleDownloadPerTanggal = (tanggal: string, items: any[]) => {
    const csv = [
      ["Nama Produk", "ID Transaksi", "Jumlah", "Harga Beli (Rp)"],
      ...items.map((i) => [i.nama, i.id, i.jumlah, i.harga]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-${tanggal}.csv`;
    link.click();
  };

  const handleDownloadKeseluruhan = () => {
    const allItems = laporanDalamPeriode.flatMap(({ tanggal, items }) =>
      items.map((i) => ({ tanggal, ...i }))
    );
    const csv = [
      ["Tanggal", "Nama Produk", "ID Transaksi", "Jumlah", "Harga Beli (Rp)"],
      ...allItems.map((i) => [
        i.tanggal,
        i.nama,
        i.id,
        i.jumlah,
        i.harga,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-${selectedMonth.replace(" ", "-")}.csv`;
    link.click();
  };

  const daftarBulan = ["September 2025", "Oktober 2025", "November 2025"];

    return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar fix di kiri */}
      <SPWONavbar onLogout={handleLogout} />

      {/* Konten utama */}
      <main className="flex-1 flex flex-col bg-gray-50 px-6 py-6 ml-100 md:px-8 lg:px-10 overflow-y-auto w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col min-h-full w-full space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800 leading-snug">
              Laporan Petty Cash <br />
              <span className="text-teal-700">Warung Oyako</span>
            </h1>

            {/* Filter periode */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <select
                value={periodeAwal}
                onChange={(e) => setPeriodeAwal(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <span className="text-gray-500 font-semibold">—</span>
              <select
                value={periodeAkhir}
                onChange={(e) => setPeriodeAkhir(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              {/* Dropdown bulan */}
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-2 text-teal-600" />
                  {selectedMonth}
                </button>
                {showCalendar && (
                  <div className="absolute z-10 bg-white shadow-lg border rounded-xl mt-2 w-44">
                    {daftarBulan.map((bulan) => (
                      <button
                        key={bulan}
                        onClick={() => {
                          setSelectedMonth(bulan);
                          setShowCalendar(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-teal-100"
                      >
                        {bulan}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Total pengeluaran */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div>
              <p className="text-gray-500 font-semibold text-lg">
                Total Pengeluaran
              </p>
              <p className="text-3xl font-extrabold text-teal-700">
                Rp {totalPengeluaran.toLocaleString("id-ID")}
              </p>
            </div>
            <button
              onClick={handleDownloadKeseluruhan}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl shadow hover:bg-teal-700 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Unduh {selectedMonth}
            </button>
          </motion.div>

          {/* Daftar laporan scrollable */}
          <div className="flex-1 overflow-y-auto space-y-6 w-full">
            {laporanDalamPeriode.length > 0 ? (
              laporanDalamPeriode.map(({ tanggal, items }, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 w-full"
                >
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <h3 className="text-lg font-bold text-teal-700">
                      {tanggal}
                    </h3>
                    <button
                      onClick={() => handleDownloadPerTanggal(tanggal, items)}
                      className="bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-teal-600"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Unduh CSV
                    </button>
                  </div>
                  <table className="w-full text-sm text-left border-t">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="py-3 px-2">Nama Produk</th>
                        <th className="py-3 px-2">ID Transaksi</th>
                        <th className="py-3 px-2">Jumlah</th>
                        <th className="py-3 px-2">Harga</th>
                        <th className="py-3 px-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((i, idx) => (
                        <tr
                          key={idx}
                          className="border-b hover:bg-gray-50 text-gray-800"
                        >
                          <td className="py-2 px-2">{i.nama}</td>
                          <td className="py-2 px-2">{i.id}</td>
                          <td className="py-2 px-2">{i.jumlah}</td>
                          <td className="py-2 px-2">
                            Rp {i.harga.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              onClick={() => {
                                const idLaporan = `100${tanggal
                                  .slice(0, 1)
                                  .padStart(2, "0")}${index}${idx}`;
                                const params = new URLSearchParams({
                                  idLaporan,
                                  tanggal,
                                  nama: i.nama,
                                  idTransaksi: i.id,
                                  jumlah: String(i.jumlah),
                                  harga: String(i.harga),
                                });
                                router.push(
                                  `/dashboard/laporan/detail?${params.toString()}`
                                );
                              }}
                              className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-teal-700 transition"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              ))
            ) : (
              <div className="bg-gray-50 text-center p-6 rounded-xl text-gray-500">
                Tidak ada data untuk bulan {selectedMonth}.
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}