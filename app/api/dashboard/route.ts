// app/api/dashboard/route.ts
import { NextRequest } from "next/server";
import { sql } from "@/app/lib/pettycash-db";

export async function GET(req: NextRequest) {
  try {
    console.log("📊 Fetching dashboard data for PostgreSQL...");
    
    // 1. Cek dulu apakah tabel pettycash ada dan strukturnya
    console.log("🔍 Checking table structure...");
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pettycash'
      ) as table_exists
    `;
    
    if (!tableCheck[0]?.table_exists) {
      console.error("❌ Table 'pettycash' does not exist");
      return Response.json({
        success: false,
        error: "Table 'pettycash' not found",
        data: getFallbackData()
      });
    }
    
    // 2. Cek kolom yang ada di tabel
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pettycash'
      ORDER BY ordinal_position
    `;
    console.log("📋 Columns in pettycash table:", columns.map(c => c.column_name));
    
    // 3. Ambil semua data dari pettycash (batasi untuk testing)
    const sampleData = await sql`
      SELECT * FROM pettycash ORDER BY tanggal DESC LIMIT 5
    `;
    console.log("🎯 Sample data from pettycash:", sampleData);
    
    // 4. Query utama dengan penyesuaian kolom
    const [totalData, transactionData, categoryData, dateRange] = await Promise.all([
      // Total transaksi dan pengeluaran
      sql`
        SELECT 
          COUNT(*) as total_transaksi,
          COALESCE(SUM(total), 0) as total_pengeluaran,
          COALESCE(AVG(total), 0) as rata_rata_transaksi
        FROM pettycash
      `,
      
      // Data transaksi untuk grafik (gunakan tanggal yang ada)
      sql`
        SELECT 
          DATE(tanggal) as tanggal,
          SUM(total) as total_harian,
          COUNT(*) as jumlah_transaksi
        FROM pettycash
        WHERE tanggal IS NOT NULL
        GROUP BY DATE(tanggal)
        ORDER BY tanggal DESC
        LIMIT 30
      `,
      
      // Data per kategori
      sql`
        SELECT 
          kategori,
          COUNT(*) as jumlah_transaksi,
          SUM(total) as total_pengeluaran
        FROM pettycash
        WHERE kategori IS NOT NULL
        GROUP BY kategori
        ORDER BY total_pengeluaran DESC
      `,
      
      // Rentang tanggal
      sql`
        SELECT 
          MIN(tanggal) as tanggal_pertama,
          MAX(tanggal) as tanggal_terakhir
        FROM pettycash
        WHERE tanggal IS NOT NULL
      `
    ]);
    
    console.log("📊 Query results:", {
      total: totalData[0],
      transactions: transactionData.length,
      categories: categoryData.length,
      dateRange: dateRange[0]
    });
    
    const stats = totalData[0] || {};
    const dateStats = dateRange[0] || {};
    const totalPengeluaran = parseFloat(stats.total_pengeluaran) || 0;
    
    // 5. Format data untuk response
    // Grafik harian
    const grafikHarian = transactionData.map((item: any) => {
      const date = new Date(item.tanggal);
      return {
        name: `${date.getDate()} ${date.toLocaleDateString('id-ID', { month: 'short' })}`,
        pengeluaran: parseFloat(item.total_harian) || 0,
        persentase: totalPengeluaran > 0 ? (parseFloat(item.total_harian) / totalPengeluaran) * 100 : 0,
        tanggal: item.tanggal,
        jumlah_transaksi: parseInt(item.jumlah_transaksi) || 0
      };
    }).reverse(); // Urutkan dari terlama ke terbaru
    
    // Grafik bulanan
    const monthlyData = await sql`
      SELECT 
        EXTRACT(MONTH FROM tanggal) as bulan,
        EXTRACT(YEAR FROM tanggal) as tahun,
        SUM(total) as total_bulanan,
        COUNT(*) as jumlah_transaksi
      FROM pettycash
      WHERE tanggal IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM tanggal), EXTRACT(MONTH FROM tanggal)
      ORDER BY tahun, bulan
    `;
    
    const bulanNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const grafikBulanan = monthlyData.map((item: any) => ({
      name: `${bulanNames[parseInt(item.bulan) - 1]} ${item.tahun}`,
      pengeluaran: parseFloat(item.total_bulanan) || 0,
      persentase: totalPengeluaran > 0 ? (parseFloat(item.total_bulanan) / totalPengeluaran) * 100 : 0,
      bulan: parseInt(item.bulan) || 0,
      tahun: parseInt(item.tahun) || 0,
      jumlah_transaksi: parseInt(item.jumlah_transaksi) || 0
    }));
    
    // Kategori
    const pengeluaranKategori: { [key: string]: number } = {};
    categoryData.forEach((item: any) => {
      pengeluaranKategori[item.kategori] = parseFloat(item.total_pengeluaran) || 0;
    });
    
    // 6. Format response - DIUBAH: HAPUS SISA SALDO
    const resultData = {
      totalTransaksi: parseInt(stats.total_transaksi) || 0,
      totalPengeluaran: totalPengeluaran,
      rataRataTransaksi: parseFloat(stats.rata_rata_transaksi) || 0,
      totalHariTransaksi: transactionData.length,
      
      grafikHarian,
      grafikMingguan: generateWeeklyData(transactionData, totalPengeluaran),
      grafikBulanan,
      pengeluaranKategori,
      
      // DIHAPUS: sisaSaldo dan anggaranAwal
      // sisaSaldo: Math.max(0, 50000000 - totalPengeluaran),
      // anggaranAwal: 50000000,
      
      tanggalPertama: dateStats.tanggal_pertama,
      tanggalTerakhir: dateStats.tanggal_terakhir,
      
      rentangData: dateStats.tanggal_pertama && dateStats.tanggal_terakhir
        ? `${new Date(dateStats.tanggal_pertama).toLocaleDateString('id-ID')} - ${new Date(dateStats.tanggal_terakhir).toLocaleDateString('id-ID')}`
        : 'Tidak ada data',
      
      jumlahKategori: Object.keys(pengeluaranKategori).length,
      dataPoints: {
        harian: grafikHarian.length,
        mingguan: Math.ceil(grafikHarian.length / 7),
        bulanan: grafikBulanan.length
      }
    };
    
    console.log("✅ Dashboard data ready:", {
      totalTransaksi: resultData.totalTransaksi,
      totalPengeluaran: resultData.totalPengeluaran,
      hasData: resultData.totalTransaksi > 0
    });
    
    return Response.json({
      success: true,
      data: resultData,
      timestamp: new Date().toISOString(),
      debug: {
        tableExists: tableCheck[0]?.table_exists,
        columns: columns.map(c => c.column_name),
        sampleCount: sampleData.length
      }
    });
    
  } catch (err: any) {
    console.error("❌ Error in dashboard API:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack
    });
    
    // Return fallback data
    return Response.json({
      success: false,
      error: err.message,
      data: getFallbackData(),
      timestamp: new Date().toISOString()
    });
  }
}

// Helper functions
function generateWeeklyData(dailyData: any[], totalPengeluaran: number) {
  if (dailyData.length === 0) return [];
  
  const weeks = [];
  for (let i = 0; i < dailyData.length; i += 7) {
    const weekData = dailyData.slice(i, i + 7);
    const weekTotal = weekData.reduce((sum, day) => sum + parseFloat(day.total_harian || 0), 0);
    const weekTransactions = weekData.reduce((sum, day) => sum + parseInt(day.jumlah_transaksi || 0), 0);
    
    weeks.push({
      name: `Minggu ${weeks.length + 1}`,
      pengeluaran: weekTotal,
      persentase: totalPengeluaran > 0 ? (weekTotal / totalPengeluaran) * 100 : 0,
      jumlah_transaksi: weekTransactions,
      periode: weekData.length > 0 
        ? `${new Date(weekData[0].tanggal).getDate()} ${new Date(weekData[0].tanggal).toLocaleDateString('id-ID', { month: 'short' })} - ${new Date(weekData[weekData.length - 1].tanggal).getDate()} ${new Date(weekData[weekData.length - 1].tanggal).toLocaleDateString('id-ID', { month: 'short' })}`
        : ''
    });
  }
  
  return weeks;
}

function getFallbackData() {
  return {
    totalTransaksi: 0,
    totalPengeluaran: 0,
    rataRataTransaksi: 0,
    totalHariTransaksi: 0,
    grafikHarian: [],
    grafikMingguan: [],
    grafikBulanan: [],
    pengeluaranKategori: {},
    // DIHAPUS: sisaSaldo dan anggaranAwal
    // sisaSaldo: 50000000,
    // anggaranAwal: 50000000,
    tanggalPertama: null,
    tanggalTerakhir: null,
    rentangData: 'Tidak ada data transaksi',
    jumlahKategori: 0,
    dataPoints: { harian: 0, mingguan: 0, bulanan: 0 }
  };
}