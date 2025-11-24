import { sql } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Transaksi bulan ini
    const transaksiBulanResult = await sql<{ total: string }[]>`
      SELECT COUNT(*) AS total 
      FROM pettycash 
      WHERE DATE_TRUNC('month', tanggal::date) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    // Pending
    const pendingResult = await sql<{ total: string }[]>`
      SELECT COUNT(*) AS total 
      FROM pettycash 
      WHERE status = 'pending'
    `;

    // Grafik Harian (7 hari terakhir)
    const grafikHarianResult = await sql<{ name: string; pengeluaran: string; persentase: string }[]>`
      SELECT 
        TO_CHAR(tanggal::date, 'Dy') AS name,
        SUM(jumlah)::numeric AS pengeluaran,
        ROUND((SUM(jumlah)::numeric / 100000) * 10, 2) AS persentase
      FROM pettycash
      WHERE tanggal::date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY name
      ORDER BY MIN(tanggal::date)
    `;

    // Grafik Mingguan (bulan ini)
    const grafikMingguanResult = await sql<{ name: string; pengeluaran: string; persentase: string }[]>`
      SELECT 
        CONCAT(
          'Minggu ', 
          (DATE_PART('week', tanggal::date)::int - DATE_PART('week', DATE_TRUNC('month', CURRENT_DATE))::int + 1)
        ) AS name,
        SUM(jumlah)::numeric AS pengeluaran,
        ROUND((SUM(jumlah)::numeric / 1000000) * 10, 2) AS persentase
      FROM pettycash
      WHERE DATE_TRUNC('month', tanggal::date) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY name
      ORDER BY name
    `;

    // Grafik Bulanan (semua data)
    const grafikBulananResult = await sql<{ name: string; pengeluaran: string; persentase: string }[]>`
      SELECT 
        TO_CHAR(tanggal::date, 'Mon') AS name,
        SUM(jumlah)::numeric AS pengeluaran,
        ROUND((SUM(jumlah)::numeric / 2000000) * 10, 2) AS persentase
      FROM pettycash
      GROUP BY name
      ORDER BY MIN(tanggal::date)
    `;

    return NextResponse.json({
      success: true,
      transaksiBulan: Number(transaksiBulanResult[0]?.total || 0),
      pending: Number(pendingResult[0]?.total || 0),
      grafikHarian: grafikHarianResult.map(g => ({
        ...g,
        pengeluaran: Number(g.pengeluaran),
        persentase: Number(g.persentase)
      })),
      grafikMingguan: grafikMingguanResult.map(g => ({
        ...g,
        pengeluaran: Number(g.pengeluaran),
        persentase: Number(g.persentase)
      })),
      grafikBulanan: grafikBulananResult.map(g => ({
        ...g,
        pengeluaran: Number(g.pengeluaran),
        persentase: Number(g.persentase)
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
