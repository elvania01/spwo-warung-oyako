import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/pettycash-db";

export async function GET(request: NextRequest) {
  try {
    const tableExists = await checkTableExists();
    
    if (!tableExists) {
      return NextResponse.json({
        success: true,
        data: getFallbackChartData(),
        message: "Menggunakan data contoh karena tabel belum dibuat"
      });
    }

    try {
      // Data untuk pie chart (kategori)
      const kategoriData = await sql`
        SELECT kategori, COUNT(*) as jumlah, SUM(total) as total
        FROM petty_cash 
        GROUP BY kategori
        ORDER BY total DESC
      `;

      // Data untuk line chart (per bulan)
      const bulananData = await sql`
        SELECT 
          DATE_TRUNC('month', tanggal) as bulan,
          EXTRACT(MONTH FROM tanggal) as bulan_angka,
          EXTRACT(YEAR FROM tanggal) as tahun,
          COUNT(*) as transaksi,
          SUM(total) as total
        FROM petty_cash 
        GROUP BY DATE_TRUNC('month', tanggal), 
                 EXTRACT(MONTH FROM tanggal), 
                 EXTRACT(YEAR FROM tanggal)
        ORDER BY bulan DESC
        LIMIT 12
      `;

      // Data untuk bar chart (produk terlaris)
      const produkData = await sql`
        SELECT nama, SUM(jumlah) as total_jumlah, SUM(total) as total_nilai
        FROM petty_cash 
        GROUP BY nama
        ORDER BY total_nilai DESC
        LIMIT 10
      `;

      // Data summary
      const summaryData = await sql`
        SELECT 
          COUNT(*) as total_transaksi,
          COALESCE(SUM(total), 0) as total_nilai,
          COALESCE(AVG(total), 0) as rata_rata,
          MIN(tanggal) as tanggal_awal,
          MAX(tanggal) as tanggal_akhir
        FROM petty_cash
      `;

      // Jika tidak ada data, gunakan fallback
      if (!kategoriData.length && !bulananData.length) {
        return NextResponse.json({
          success: true,
          data: getFallbackChartData(),
          message: "Menggunakan data contoh karena tabel masih kosong"
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          kategori: kategoriData,
          bulanan: bulananData,
          produk: produkData,
          summary: summaryData[0] || getFallbackChartData().summary
        }
      });
    } catch (queryError: any) {
      console.error("Database query error:", queryError);
      
      return NextResponse.json({
        success: true,
        data: getFallbackChartData(),
        message: "Menggunakan data contoh karena terjadi kesalahan query"
      });
    }
  } catch (err: any) {
    console.error("Error fetching chart data:", err);
    
    return NextResponse.json({
      success: true,
      data: getFallbackChartData(),
      message: "Menggunakan data contoh karena terjadi kesalahan sistem"
    });
  }
}

async function checkTableExists(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'petty_cash'
      ) as table_exists;
    `;
    return result[0]?.table_exists || false;
  } catch (error) {
    console.error("Error checking table existence:", error);
    return false;
  }
}

function getFallbackChartData() {
  return {
    kategori: [
      { kategori: "Bahan Baku", jumlah: 5, total: 250000 },
      { kategori: "Operasional", jumlah: 3, total: 150000 },
      { kategori: "ATK", jumlah: 2, total: 50000 },
      { kategori: "Lainnya", jumlah: 1, total: 25000 }
    ],
    bulanan: [
      { bulan: "2024-01-01", bulan_angka: 1, tahun: 2024, transaksi: 5, total: 475000 },
      { bulan: "2024-02-01", bulan_angka: 2, tahun: 2024, transaksi: 3, total: 300000 },
      { bulan: "2024-03-01", bulan_angka: 3, tahun: 2024, transaksi: 4, total: 350000 }
    ],
    produk: [
      { nama: "Es Batu", total_jumlah: 25, total_nilai: 500000 },
      { nama: "Tisu", total_jumlah: 30, total_nilai: 300000 },
      { nama: "Garam", total_jumlah: 15, total_nilai: 75000 },
      { nama: "Plastik Kemasan", total_jumlah: 200, total_nilai: 500000 },
      { nama: "Lada", total_jumlah: 10, total_nilai: 30000 }
    ],
    summary: {
      total_transaksi: 11,
      total_nilai: 1405000,
      rata_rata: 127727.27,
      tanggal_awal: "2024-01-01",
      tanggal_akhir: "2024-03-31"
    }
  };
}