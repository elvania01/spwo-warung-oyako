import { sql } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user = url.searchParams.get("user");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Parameter 'user' wajib diberikan" },
        { status: 400 }
      );
    }

    // @ts-ignore - Abaikan error type untuk sementara
    const transaksiBulanResult = await sql`
      SELECT COUNT(*) AS total
      FROM pettycash
      WHERE DATE_TRUNC('month', tanggal::date) = DATE_TRUNC('month', CURRENT_DATE)
        AND dibuat_oleh = ${user}
    `;

    // @ts-ignore
    const grafikHarianResult = await sql`
      SELECT 
        TO_CHAR(tanggal::date, 'Dy') AS name,
        SUM(harga * jumlah)::numeric AS pengeluaran,
        ROUND((SUM(harga * jumlah)::numeric / 100000) * 10, 2) AS persentase
      FROM pettycash
      WHERE tanggal::date >= CURRENT_DATE - INTERVAL '6 days'
        AND dibuat_oleh = ${user}
      GROUP BY name
      ORDER BY MIN(tanggal::date)
    `;

    // @ts-ignore
    const grafikMingguanResult = await sql`
      SELECT 
        CONCAT(
          'Minggu ',
          (DATE_PART('week', tanggal::date)::int - DATE_PART('week', DATE_TRUNC('month', CURRENT_DATE))::int + 1)
        ) AS name,
        SUM(harga * jumlah)::numeric AS pengeluaran,
        ROUND((SUM(harga * jumlah)::numeric / 1000000) * 10, 2) AS persentase
      FROM pettycash
      WHERE DATE_TRUNC('month', tanggal::date) = DATE_TRUNC('month', CURRENT_DATE)
        AND dibuat_oleh = ${user}
      GROUP BY name
      ORDER BY name
    `;

    // @ts-ignore
    const grafikBulananResult = await sql`
      SELECT
        TO_CHAR(tanggal::date, 'Mon') AS name,
        SUM(harga * jumlah)::numeric AS pengeluaran,
        ROUND((SUM(harga * jumlah)::numeric / 2000000) * 10, 2) AS persentase
      FROM pettycash
      WHERE dibuat_oleh = ${user}
      GROUP BY name
      ORDER BY MIN(tanggal::date)
    `;

    return NextResponse.json({
      success: true,
      transaksiBulan: Number(transaksiBulanResult[0]?.total || 0),
      pending: 0,
      grafikHarian: (grafikHarianResult || []).map((g: any) => ({
        name: g.name,
        pengeluaran: Number(g.pengeluaran || 0),
        persentase: Number(g.persentase || 0),
      })),
      grafikMingguan: (grafikMingguanResult || []).map((g: any) => ({
        name: g.name,
        pengeluaran: Number(g.pengeluaran || 0),
        persentase: Number(g.persentase || 0),
      })),
      grafikBulanan: (grafikBulananResult || []).map((g: any) => ({
        name: g.name,
        pengeluaran: Number(g.pengeluaran || 0),
        persentase: Number(g.persentase || 0),
      })),
    });
  } catch (error) {
    console.error("Dashboard Kasir API error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}