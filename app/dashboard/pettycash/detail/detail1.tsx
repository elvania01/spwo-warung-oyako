"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SPWONavbar from "@/components/SPWOsidebar";
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react";

interface DetailPettyCashProps {
  id: number;
  nama: string;
  jumlah: number;
  harga: number;
  kategori: string;
  gambarUrl: string;
  tanggal: string;
  total: number;
  created_at?: string;
}

export default function DetailPettyCashClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<DetailPettyCashProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ambil ID dari URL parameter
        const id = searchParams.get('id');
        
        if (!id) {
          // Coba ambil dari sessionStorage (fallback)
          const storedData = sessionStorage.getItem("pettyCashDetail");
          if (storedData) {
            setData(JSON.parse(storedData));
            return;
          } else {
            throw new Error("ID transaksi tidak ditemukan");
          }
        }

        // Fetch dari API
        const response = await fetch(`/api/pettycash?id=${id}`);
        
        if (!response.ok) {
          throw new Error(`Gagal mengambil data: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || "Data tidak ditemukan");
        }
        
        if (!result.data || result.data.length === 0) {
          throw new Error("Transaksi tidak ditemukan");
        }
        
        const item = result.data[0];
        setData({
          id: item.id,
          nama: item.nama,
          jumlah: item.jumlah,
          harga: parseFloat(item.harga),
          kategori: item.kategori,
          gambarUrl: item.gambar_url || "",
          tanggal: item.tanggal,
          total: parseFloat(item.total) || (item.jumlah * parseFloat(item.harga)),
          created_at: item.created_at
        });
        
        // Simpan juga ke sessionStorage untuk backup
        sessionStorage.setItem("pettyCashDetail", JSON.stringify({
          id: item.id,
          nama: item.nama,
          jumlah: item.jumlah,
          harga: parseFloat(item.harga),
          kategori: item.kategori,
          gambarUrl: item.gambar_url || "",
          tanggal: item.tanggal,
          total: parseFloat(item.total) || (item.jumlah * parseFloat(item.harga))
        }));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        console.error("Error fetching detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("isLoggedIn");
    router.push("/autentikasi/login");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && data) {
      try {
        await navigator.share({
          title: `Detail Transaksi: ${data.nama}`,
          text: `Transaksi Petty Cash: ${data.nama} - Rp ${data.total.toLocaleString("id-ID")}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link telah disalin ke clipboard!');
    }
  };

  const handleDownload = () => {
    if (!data) return;

    const csvContent = [
      ["Detail Transaksi Petty Cash - Warung Oyako"],
      [""],
      ["ID Transaksi", data.id],
      ["Nama Produk", data.nama],
      ["Kategori", data.kategori],
      ["Jumlah", data.jumlah],
      ["Harga Satuan", `Rp ${data.harga.toLocaleString("id-ID")}`],
      ["Total", `Rp ${data.total.toLocaleString("id-ID")}`],
      ["Tanggal", new Date(data.tanggal).toLocaleDateString("id-ID")],
      ["Tanggal Input", data.created_at ? new Date(data.created_at).toLocaleDateString("id-ID") : "-"],
      [""],
      ["URL Gambar", data.gambarUrl || "Tidak ada gambar"]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pettycash-detail-${data.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fungsi untuk memvalidasi Base64 URL
  const isValidImage = (url: string | null | undefined): boolean => {
    if (!url) return false;
    
    // Cek jika Base64
    if (url.startsWith('data:image/')) {
      const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml);base64,/i;
      return base64Regex.test(url);
    }
    
    // Cek jika URL biasa
    if (url.startsWith('http') || url.startsWith('/')) {
      return true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <SPWONavbar onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail transaksi...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <SPWONavbar onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-red-700 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">{error || "Transaksi tidak ditemukan"}</p>
            <button
              onClick={() => router.back()}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              ← Kembali
            </button>
          </div>
        </main>
      </div>
    );
  }

  const hasValidImage = isValidImage(data.gambarUrl);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <SPWONavbar onLogout={handleLogout} />
      
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 w-fit"
            >
              <ArrowLeft size={20} /> Kembali ke Daftar
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
              >
                <Share2 size={16} /> Bagikan
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center gap-2"
              >
                <Download size={16} /> CSV
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition flex items-center gap-2"
              >
                <Printer size={16} /> Cetak
              </button>
            </div>
          </div>

          {/* Header Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">Detail Transaksi Petty Cash</h1>
            <p className="text-gray-600">Warung Oyako - Sistem Pengelolaan Keuangan</p>
            <div className="mt-2 text-sm text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">
              ID: #{data.id} • {new Date(data.tanggal).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Stats */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-1">Total Transaksi</p>
                  <p className="text-2xl md:text-3xl font-bold">Rp {data.total.toLocaleString("id-ID")}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-1">Harga Satuan</p>
                  <p className="text-2xl md:text-3xl font-bold">Rp {data.harga.toLocaleString("id-ID")}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-1">Jumlah</p>
                  <p className="text-2xl md:text-3xl font-bold">{data.jumlah} item</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Details */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Informasi Transaksi</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                        <p className="text-lg font-semibold text-gray-800">#{data.id}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Kategori</p>
                        <p className="text-lg font-semibold text-gray-800">{data.kategori}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Nama Produk</p>
                      <p className="text-lg font-semibold text-gray-800">{data.nama}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Jumlah</p>
                        <p className="text-lg font-semibold text-gray-800">{data.jumlah}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Harga Satuan</p>
                        <p className="text-lg font-semibold text-gray-800">Rp {data.harga.toLocaleString("id-ID")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Tanggal Transaksi</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {new Date(data.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Tanggal Input</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {data.created_at 
                            ? new Date(data.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-emerald-700 mb-1">Total Pembayaran</p>
                          <p className="text-2xl font-bold text-emerald-800">
                            Rp {data.total.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="text-emerald-600 text-2xl">
                          💰
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Bukti Pembelian</h2>
                  
                  {hasValidImage ? (
                    <div className="space-y-4">
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                        <div className="relative w-full h-64 md:h-80">
                          <img
                            src={data.gambarUrl}
                            alt={`Bukti pembelian ${data.nama}`}
                            className="w-full h-full object-contain p-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 mb-2">
                          <strong>Info Gambar:</strong> {data.gambarUrl.startsWith('data:image/') 
                            ? 'Disimpan sebagai Base64 di database' 
                            : 'Disimpan di server'}
                        </p>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(data.gambarUrl, '_blank')}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          >
                            🔍 Lihat Full
                          </button>
                          
                          {data.gambarUrl.startsWith('data:image/') && (
                            <button
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = data.gambarUrl;
                                a.download = `bukti-${data.id}.${data.gambarUrl.includes('jpeg') ? 'jpg' : 'png'}`;
                                a.click();
                              }}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                            >
                              📥 Download
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-gray-400">📷</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak Ada Bukti Pembelian</h3>
                      <p className="text-gray-500 text-sm">
                        Bukti pembelian belum diupload saat transaksi dibuat.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Transaksi</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ID Transaksi</p>
                      <p className="font-semibold">#{data.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Produk</p>
                      <p className="font-semibold">{data.nama}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-semibold text-emerald-700">Rp {data.total.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Data ini diambil dari sistem database Petty Cash Warung Oyako.</p>
                <p className="mt-1">© {new Date().getFullYear()} Warung Oyako - Semua hak dilindungi.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}