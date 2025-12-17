"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";
import { Download, ArrowLeft, FileText, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Tipe data berdasarkan tabel pettycash
interface Transaction {
  id: number;
  nama: string;
  kategori: string;
  jumlah: number;
  harga: string; // dari database numeric
  total: string; // dari database numeric
  tanggal: string;
  gambar_url?: string | null;
  created_at: string;
}

interface DateInfo {
  formatted: string;
  table: string;
}

const generateIdLaporan = () =>
  `LP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const formatDate = (dateString: string): DateInfo => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return {
        formatted: "Tanggal tidak valid",
        table: "Tanggal tidak valid"
      };
    }
    
    return {
      formatted: date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      table: date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };
  } catch (error) {
    return {
      formatted: "Format tanggal salah",
      table: "Format tanggal salah"
    };
  }
};

export default function DetailLaporanClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil ID dari parameter URL - coba beberapa kemungkinan nama parameter
  const idFromUrl = searchParams.get("id") || 
                    searchParams.get("idLaporan") || 
                    searchParams.get("transactionId");
  
  // Debug: Tampilkan semua parameter yang diterima
  const allParams: { [key: string]: string | null } = {};
  searchParams.forEach((value, key) => {
    allParams[key] = value;
  });
  
  console.log("Semua parameter URL:", allParams);
  console.log("ID yang digunakan:", idFromUrl);

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idLaporan = generateIdLaporan();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        
        if (!idFromUrl) {
          // Jika tidak ada ID, coba cari berdasarkan nama atau ambil data terbaru
          const namaParam = searchParams.get("nama");
          if (namaParam) {
            // Cari berdasarkan nama
            const response = await fetch("/api/pettycash");
            if (!response.ok) throw new Error("Gagal mengambil data");
            
            const result = await response.json();
            const found = result.data.find((item: Transaction) => 
              item.nama.toLowerCase().includes(namaParam.toLowerCase())
            );
            
            if (found) {
              setTransaction(found);
              return;
            }
          }
          
          throw new Error("ID transaksi tidak ditemukan dalam URL");
        }
        
        // Ambil data berdasarkan ID dari API pettycash
        const response = await fetch(`/api/pettycash?id=${idFromUrl}`);
        
        if (!response.ok) {
          throw new Error("Gagal mengambil data dari server");
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || "Data tidak ditemukan");
        }
        
        if (!result.data || result.data.length === 0) {
          // Coba cari dengan metode lain
          const allResponse = await fetch("/api/pettycash");
          const allData = await allResponse.json();
          
          // Cari berdasarkan ID atau nama
          const found = allData.data.find((item: Transaction) => 
            item.id.toString() === idFromUrl || 
            item.nama.toLowerCase().includes(idFromUrl.toLowerCase())
          );
          
          if (found) {
            setTransaction(found);
          } else {
            throw new Error(`Transaksi dengan ID ${idFromUrl} tidak ditemukan dalam database pettycash`);
          }
        } else {
          setTransaction(result.data[0]);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        console.error("Error fetching transaction:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [idFromUrl, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  const handleDownloadDetail = () => {
    if (!transaction) return;

    const dateInfo = formatDate(transaction.tanggal);
    const hargaNum = parseFloat(transaction.harga);
    const totalNum = parseFloat(transaction.total);

    const csv = [
      ["Detail Laporan Petty Cash - Warung Oyako"],
      [""],
      ["Tanggal Pembelian", dateInfo.formatted],
      ["ID Laporan Sistem", idLaporan],
      ["ID Transaksi Database", transaction.id],
      ["Nama Item", transaction.nama],
      ["Kategori", transaction.kategori],
      [""],
      ["Field", "Value"],
      ["ID", transaction.id.toString()],
      ["Nama", transaction.nama],
      ["Kategori", transaction.kategori],
      ["Jumlah", transaction.jumlah.toString()],
      ["Harga Satuan", `Rp ${hargaNum.toLocaleString("id-ID")}`],
      ["Tanggal", dateInfo.table],
      ["Total", `Rp ${totalNum.toLocaleString("id-ID")}`],
      ["Tanggal Input", new Date(transaction.created_at).toLocaleDateString('id-ID')],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pettycash-detail-${transaction.id}-${idLaporan}.csv`;
    link.click();
  };

  const formatRupiah = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `Rp ${numValue.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <SPWONavbar onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
            <p className="mt-4 text-gray-600">Memuat data transaksi...</p>
            <p className="text-sm text-gray-500 mt-2">ID: {idFromUrl || "Tidak ada ID"}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <SPWONavbar onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">{error || "Transaksi tidak ditemukan dalam database pettycash"}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</p>
              <p className="text-xs text-yellow-700">
                ID dari URL: <strong>{idFromUrl || "Kosong"}</strong>
              </p>
              <p className="text-xs text-yellow-700">
                Semua parameter: {JSON.stringify(allParams)}
              </p>
            </div>
            
            <button
              onClick={() => router.back()}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Kembali ke Daftar
            </button>
          </div>
        </main>
      </div>
    );
  }

  const dateInfo = formatDate(transaction.tanggal);
  const hargaNum = parseFloat(transaction.harga);
  const totalNum = parseFloat(transaction.total);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <SPWONavbar onLogout={handleLogout} />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Header dengan tombol kembali */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 w-fit"
            >
              <ArrowLeft size={20} /> Kembali
            </button>
            
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <FileText className="text-emerald-600" size={28} />
                Detail Transaksi Petty Cash
              </h1>
            </div>
            
            <button
              onClick={handleDownloadDetail}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 w-fit transition"
            >
              <Download size={20} /> Unduh CSV
            </button>
          </div>

          {/* Info Debug (hanya di development)
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-800">Debug Info:</p>
              <p className="text-blue-700">ID dari URL: {idFromUrl}</p>
              <p className="text-blue-700">ID Database: {transaction.id}</p>
            </div>
          )} */}

          {/* Card utama */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header dengan gradient */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm opacity-90">Tanggal Transaksi</p>
                  <p className="text-xl md:text-2xl font-bold">{dateInfo.formatted}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">ID Laporan</p>
                  <p className="text-xl md:text-2xl font-bold">{idLaporan}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">ID Database</p>
                  <p className="text-xl md:text-2xl font-bold">#{transaction.id}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Total</p>
                  <p className="text-xl md:text-2xl font-bold">{formatRupiah(totalNum)}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Informasi transaksi */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Nama Item</p>
                  <p className="text-lg font-semibold text-gray-800">{transaction.nama}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Kategori</p>
                  <p className="text-lg font-semibold text-gray-800">{transaction.kategori}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Jumlah</p>
                  <p className="text-lg font-semibold text-gray-800">{transaction.jumlah} pcs</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Tanggal Input</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Tabel detail */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full min-w-full">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-emerald-800">Nama Item</th>
                      <th className="p-4 text-left font-semibold text-emerald-800">ID</th>
                      <th className="p-4 text-left font-semibold text-emerald-800">Jumlah</th>
                      <th className="p-4 text-left font-semibold text-emerald-800">Harga Satuan</th>
                      <th className="p-4 text-left font-semibold text-emerald-800">Tanggal</th>
                      <th className="p-4 text-left font-semibold text-emerald-800">Kategori</th>
                      <th className="p-4 text-left font-semibold text-emerald-800">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{transaction.nama}</td>
                      <td className="p-4 font-mono">#{transaction.id}</td>
                      <td className="p-4">{transaction.jumlah}</td>
                      <td className="p-4">{formatRupiah(hargaNum)}</td>
                      <td className="p-4">{dateInfo.table}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                          {transaction.kategori}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-700">
                        {formatRupiah(totalNum)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={6} className="p-4 text-right font-semibold">
                        Total:
                      </td>
                      <td className="p-4 font-bold text-lg text-emerald-700">
                        {formatRupiah(totalNum)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Catatan */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Catatan:</strong> Data ini diambil dari tabel <code>pettycash</code> database.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}