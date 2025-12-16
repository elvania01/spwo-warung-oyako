"use client";

import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

Chart.register(...registerables);

interface PettyCashItem {
  id: string;
  nama: string;
  kategori: string;
  jumlah: number;
  harga: number;
  tanggal: string;
  total: number;
}

interface KategoriSummary {
  kategori: string;
  jumlah: number;
  total: number;
}

interface BulananSummary {
  bulan: string;
  bulan_angka: number;
  tahun: number;
  transaksi: number;
  total: number;
}

interface ProdukSummary {
  nama_produk: string;
  total_jumlah: number;
  total_nilai: number;
}

interface SummaryData {
  total_transaksi: number;
  total_nilai: number;
  rata_rata: number;
  tanggal_awal?: string;
  tanggal_akhir?: string;
}

export default function DashboardCharts() {
  const [pettyCashData, setPettyCashData] = useState<PettyCashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Helper function to safely convert date to ISO string
  const safeToISOString = (date: Date | null): string | undefined => {
    if (!date || isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString().split('T')[0];
  };

  // Helper function to safely format date
  const safeFormatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      return date.toLocaleDateString('id-ID', { 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  // Fetch data pettycash langsung dari API utama
  const fetchPettyCashData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/pettycash');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Transform data ke format yang konsisten
        const transformedData: PettyCashItem[] = result.data
          .filter((item: any) => item)
          .map((item: any) => ({
            id: item.id_transaksi || item.id || `PC${Date.now()}`,
            nama: item.nama_produk || item.nama || "Produk",
            kategori: item.kategori || "Umum",
            jumlah: Number(item.jumlah) || 1,
            harga: parseFloat(item.harga) || 0,
            tanggal: item.tanggal || new Date().toISOString().split('T')[0],
            total: parseFloat(item.total) || (Number(item.jumlah) || 0) * (parseFloat(item.harga) || 0)
          }));
        
        setPettyCashData(transformedData);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Gagal mengambil data');
      }
    } catch (err: any) {
      console.error('Error loading petty cash data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Proses data untuk chart
  const processChartData = () => {
    if (pettyCashData.length === 0) {
      return {
        kategori: [],
        bulanan: [],
        produk: [],
        summary: {
          total_transaksi: 0,
          total_nilai: 0,
          rata_rata: 0
        }
      };
    }

    // Group by kategori
    const kategoriMap = new Map<string, { jumlah: number; total: number }>();
    // Group by bulan
    const bulananMap = new Map<string, { bulan_angka: number; tahun: number; transaksi: number; total: number }>();
    // Group by produk
    const produkMap = new Map<string, { total_jumlah: number; total_nilai: number }>();

    let totalNilai = 0;
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    pettyCashData.forEach(item => {
      try {
        const itemDate = new Date(item.tanggal);
        
        // Skip invalid dates
        if (isNaN(itemDate.getTime())) {
          return;
        }
        
        // Update tanggal awal dan akhir
        if (!earliestDate || itemDate < earliestDate) {
          earliestDate = itemDate;
        }
        if (!latestDate || itemDate > latestDate) {
          latestDate = itemDate;
        }

        totalNilai += item.total;

        // Kategori
        const kategoriKey = item.kategori;
        if (kategoriMap.has(kategoriKey)) {
          const existing = kategoriMap.get(kategoriKey)!;
          kategoriMap.set(kategoriKey, {
            jumlah: existing.jumlah + 1,
            total: existing.total + item.total
          });
        } else {
          kategoriMap.set(kategoriKey, {
            jumlah: 1,
            total: item.total
          });
        }

        // Bulanan
        const bulanKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (bulananMap.has(bulanKey)) {
          const existing = bulananMap.get(bulanKey)!;
          bulananMap.set(bulanKey, {
            bulan_angka: itemDate.getMonth() + 1,
            tahun: itemDate.getFullYear(),
            transaksi: existing.transaksi + 1,
            total: existing.total + item.total
          });
        } else {
          bulananMap.set(bulanKey, {
            bulan_angka: itemDate.getMonth() + 1,
            tahun: itemDate.getFullYear(),
            transaksi: 1,
            total: item.total
          });
        }

        // Produk
        const produkKey = item.nama;
        if (produkMap.has(produkKey)) {
          const existing = produkMap.get(produkKey)!;
          produkMap.set(produkKey, {
            total_jumlah: existing.total_jumlah + item.jumlah,
            total_nilai: existing.total_nilai + item.total
          });
        } else {
          produkMap.set(produkKey, {
            total_jumlah: item.jumlah,
            total_nilai: item.total
          });
        }
      } catch (error) {
        console.error('Error processing item:', item, error);
      }
    });

    // Convert maps to arrays
    const kategori: KategoriSummary[] = Array.from(kategoriMap.entries()).map(([kategori, data]) => ({
      kategori,
      jumlah: data.jumlah,
      total: data.total
    }));

    const bulanan: BulananSummary[] = Array.from(bulananMap.entries()).map(([_, data]) => ({
      bulan: `${data.tahun}-${String(data.bulan_angka).padStart(2, '0')}-01`,
      bulan_angka: data.bulan_angka,
      tahun: data.tahun,
      transaksi: data.transaksi,
      total: data.total
    }));

    const produk: ProdukSummary[] = Array.from(produkMap.entries()).map(([nama_produk, data]) => ({
      nama_produk,
      total_jumlah: data.total_jumlah,
      total_nilai: data.total_nilai
    }));

    // Sort data
    kategori.sort((a, b) => b.total - a.total);
    bulanan.sort((a, b) => {
      const dateA = new Date(a.bulan);
      const dateB = new Date(b.bulan);
      return dateA.getTime() - dateB.getTime();
    });
    produk.sort((a, b) => b.total_nilai - a.total_nilai);

    // Format summary data menggunakan helper function
    const summary: SummaryData = {
      total_transaksi: pettyCashData.length,
      total_nilai: totalNilai,
      rata_rata: pettyCashData.length > 0 ? totalNilai / pettyCashData.length : 0,
      tanggal_awal: safeToISOString(earliestDate),
      tanggal_akhir: safeToISOString(latestDate)
    };

    return { kategori, bulanan, produk, summary };
  };

  useEffect(() => {
    fetchPettyCashData();
    
    // Setup auto-refresh jika diaktifkan
    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchPettyCashData();
      }, 30000); // Refresh setiap 30 detik
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const chartData = processChartData();

  if (loading && pettyCashData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-gray-600">Memuat data chart...</p>
      </div>
    );
  }

  // Persiapkan data untuk charts
  const pieData = {
    labels: chartData.kategori.map(item => item.kategori || "Lainnya"),
    datasets: [{
      data: chartData.kategori.map(item => item.total || 0),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
      ].slice(0, chartData.kategori.length),
      borderWidth: 1,
    }]
  };

  const lineData = {
    labels: chartData.bulanan.map(item => safeFormatDate(item.bulan)),
    datasets: [{
      label: 'Total Transaksi',
      data: chartData.bulanan.map(item => item.total || 0),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const barData = {
    labels: chartData.produk.slice(0, 10).map(item => {
      const name = item.nama_produk || "Produk";
      return name.length > 15 ? `${name.substring(0, 15)}...` : name;
    }),
    datasets: [{
      label: 'Total Nilai',
      data: chartData.produk.slice(0, 10).map(item => item.total_nilai || 0),
      backgroundColor: '#10B981',
      borderColor: '#059669',
      borderWidth: 1,
    }]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
              label += new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(value);
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <div className="space-y-6">
      {/* Header dengan toggle auto-refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Analisis Petty Cash</h2>
          <p className="text-sm text-gray-600">
            Data realtime dari transaksi petty cash
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`relative inline-block w-12 h-6 rounded-full cursor-pointer ${autoRefresh ? 'bg-emerald-500' : 'bg-gray-300'}`}
                 onClick={() => setAutoRefresh(!autoRefresh)}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoRefresh ? 'right-1' : 'left-1'}`}></div>
            </div>
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </div>
          <button
            onClick={fetchPettyCashData}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors text-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memuat...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-700">Error: {error}</p>
              <button
                onClick={fetchPettyCashData}
                className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-blue-700">
                {autoRefresh ? 'Auto-refresh aktif' : 'Auto-refresh nonaktif'}
              </span>
            </div>
            <span className="text-sm text-blue-600">•</span>
            <span className="text-sm text-blue-600">
              {pettyCashData.length} transaksi ditemukan
            </span>
          </div>
          <span className="text-xs text-blue-500">
            Terakhir diupdate: {lastUpdated.toLocaleTimeString('id-ID')}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Transaksi</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {chartData.summary.total_transaksi.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {chartData.summary.tanggal_awal && chartData.summary.tanggal_akhir 
              ? `Periode: ${chartData.summary.tanggal_awal} - ${chartData.summary.tanggal_akhir}`
              : 'Belum ada data transaksi'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            Rp {chartData.summary.total_nilai.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {chartData.summary.total_transaksi > 0 
              ? `Rata-rata: Rp ${Math.round(chartData.summary.rata_rata).toLocaleString('id-ID')}/transaksi`
              : 'Belum ada transaksi'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Kategori Teratas</h3>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {chartData.kategori.length > 0 ? chartData.kategori[0].kategori : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {chartData.kategori.length > 0 
              ? `Rp ${chartData.kategori[0].total.toLocaleString('id-ID')} (${chartData.kategori[0].jumlah} transaksi)`
              : 'Belum ada data kategori'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Trend Bulanan */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Trend Bulanan
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {chartData.bulanan.length} bulan
            </span>
          </div>
          <div className="h-64">
            {chartData.bulanan.length > 0 ? (
              <Line 
                data={lineData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: false,
                      text: 'Trend Bulanan'
                    }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">Tidak ada data untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart - Distribusi Kategori */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Distribusi Kategori
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {chartData.kategori.length} kategori
            </span>
          </div>
          <div className="h-64">
            {chartData.kategori.length > 0 ? (
              <Pie 
                data={pieData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: false,
                      text: 'Distribusi Kategori'
                    }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">Tidak ada data untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart - Produk Terlaris */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Produk dengan Nilai Terbesar
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Top {Math.min(10, chartData.produk.length)} produk
            </span>
          </div>
          <div className="h-72">
            {chartData.produk.length > 0 ? (
              <Bar 
                data={barData} 
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value: any) {
                          if (typeof value === 'number') {
                            return 'Rp ' + value.toLocaleString('id-ID');
                          }
                          return value;
                        }
                      }
                    }
                  },
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: false,
                      text: 'Produk Terlaris'
                    }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">Tidak ada data untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3">Detail Data</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Data: <span className="font-semibold">{pettyCashData.length} transaksi</span></p>
            <p className="text-gray-600">Kategori: <span className="font-semibold">{chartData.kategori.length} jenis</span></p>
          </div>
          <div>
            <p className="text-gray-600">Rentang Tanggal: <span className="font-semibold">
              {chartData.summary.tanggal_awal && chartData.summary.tanggal_akhir 
                ? `${chartData.summary.tanggal_awal} - ${chartData.summary.tanggal_akhir}`
                : 'Tidak tersedia'}
            </span></p>
            <p className="text-gray-600">Produk Unik: <span className="font-semibold">{chartData.produk.length} jenis</span></p>
          </div>
          <div>
            <p className="text-gray-600">Status Auto-refresh: <span className={`font-semibold ${autoRefresh ? 'text-green-600' : 'text-gray-600'}`}>
              {autoRefresh ? 'Aktif (30 detik)' : 'Nonaktif'}
            </span></p>
            <p className="text-gray-600">Terakhir Diperbarui: <span className="font-semibold">{lastUpdated.toLocaleTimeString('id-ID')}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}