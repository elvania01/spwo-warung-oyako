"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Download, FileSpreadsheet } from "lucide-react";
import SPWONavbar from "@/components/SPWOsidebar";
import { useRouter } from "next/navigation";

interface PettyCashItem {
  id: number;
  nama: string;
  id_transaksi: string;
  jumlah: number;
  harga: number;
  tanggal: string;
}

export default function LaporanPage() {
  // Pilih tanggal mulai dan akhir
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [dataLaporan, setDataLaporan] = useState<PettyCashItem[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  const fetchPettyCash = async () => {
    try {
      const res = await fetch("/api/pettycash");
      const result = await res.json();
      if (result.success) setDataLaporan(result.data);
      else console.error(result.error);
    } catch (err) {
      console.error("Gagal fetch pettycash:", err);
    }
  };

  useEffect(() => {
    fetchPettyCash();
  }, []);

  // Filter data berdasarkan tanggal mulai dan akhir
  const laporanDalamPeriode = dataLaporan
    .filter(item => {
      if (!startDate || !endDate) return true;
      const tgl = new Date(item.tanggal);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return tgl >= start && tgl <= end;
    })
    .reduce<Record<string, PettyCashItem[]>>((acc, item) => {
      const tglStr = new Date(item.tanggal).toLocaleDateString("id-ID");
      if (!acc[tglStr]) acc[tglStr] = [];
      acc[tglStr].push(item);
      return acc;
    }, {});

  const tanggalList = Object.keys(laporanDalamPeriode);
  const totalPages = Math.ceil(tanggalList.length / itemsPerPage);
  const currentTanggalList = tanggalList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalPengeluaran = Object.values(laporanDalamPeriode).flat()
    .reduce((total, i) => total + i.harga * i.jumlah, 0);

  const handleDownloadPerTanggal = (tanggal: string, items: PettyCashItem[]) => {
    const csv = [
      ["Nama Produk", "ID Laporan", "ID Transaksi", "Jumlah", "Harga Beli (Rp)"],
      ...items.map(i => [i.nama, i.id, i.id_transaksi, i.jumlah, i.harga])
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-${tanggal}.csv`;
    link.click();
  };

  const handleDownloadKeseluruhan = () => {
    const allItems = Object.entries(laporanDalamPeriode).flatMap(([tanggal, items]) =>
      items.map(i => ({
        tanggal_laporan: tanggal,
        nama: i.nama,
        id_laporan: i.id,
        id_transaksi: i.id_transaksi,
        jumlah: i.jumlah,
        harga: i.harga
      }))
    );

    const csv = [
      ["Tanggal", "Nama Produk", "ID Laporan", "ID Transaksi", "Jumlah", "Harga Beli (Rp)"],
      ...allItems.map(i => [i.tanggal_laporan, i.nama, i.id_laporan, i.id_transaksi, i.jumlah, i.harga])
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-${startDate}-${endDate}.csv`;
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <SPWONavbar onLogout={handleLogout} />
      <main className="flex-1 flex flex-col bg-gray-50 px-6 py-6 ml-100 md:px-8 lg:px-10 overflow-y-auto w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col min-h-full w-full space-y-6">

          {/* Header & Filter */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800 leading-snug">
              Laporan Petty Cash <br />
              <span className="text-teal-700">Warung Oyako</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <label>
                Dari:{" "}
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </label>
              <label>
                Sampai:{" "}
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </label>
            </div>
          </div>

          {/* Total Pengeluaran */}
          <motion.div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div>
              <p className="text-gray-500 font-semibold text-lg">Total Pengeluaran</p>
              <p className="text-3xl font-extrabold text-teal-700">Rp {totalPengeluaran.toLocaleString("id-ID")}</p>
            </div>
            <button onClick={handleDownloadKeseluruhan} className="bg-teal-600 text-white px-6 py-3 rounded-xl shadow hover:bg-teal-700 transition flex items-center gap-2">
              <Download className="w-5 h-5" />
              Unduh Laporan
            </button>
          </motion.div>

          {/* Daftar laporan per tanggal */}
          <div className="flex-1 overflow-y-auto space-y-6 w-full">
            {currentTanggalList.length > 0 ? currentTanggalList.map((tanggal, index) => {
              const items = laporanDalamPeriode[tanggal];
              return (
                <motion.div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 w-full">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <h3 className="text-lg font-bold text-teal-700">{tanggal}</h3>
                    <button onClick={() => handleDownloadPerTanggal(tanggal, items)} className="bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-teal-600">
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
                        <tr key={idx} className="border-b hover:bg-gray-50 text-gray-800">
                          <td className="py-2 px-2">{i.nama}</td>
                          <td className="py-2 px-2">{i.id}</td>
                          <td className="py-2 px-2">{i.jumlah}</td>
                          <td className="py-2 px-2">Rp {i.harga.toLocaleString("id-ID")}</td>
                          <td className="py-2 px-2 text-right">
                            <button
                              onClick={() => {
                                const params = new URLSearchParams({
                                  idLaporan: i.id.toString(),
                                  tanggal,
                                  nama: i.nama,
                                  idTransaksi: i.id_transaksi,
                                  jumlah: i.jumlah.toString(),
                                  harga: i.harga.toString()
                                });
                                router.push(`/dashboard/laporan/detail?${params.toString()}`);
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
              )
            }) : (
              <div className="bg-gray-50 text-center p-6 rounded-xl text-gray-500">Tidak ada data dalam rentang tanggal ini.</div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button disabled={page===1} onClick={()=>setPage(page-1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Prev</button>
                <span>{page} / {totalPages}</span>
                <button disabled={page===totalPages} onClick={()=>setPage(page+1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
