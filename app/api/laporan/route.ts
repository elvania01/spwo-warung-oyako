// app/api/laporan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dari = searchParams.get("dari");
    const sampai = searchParams.get("sampai");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // ===== HITUNG TOTAL DATA =====
    const countQuery = dari && sampai
      ? await sql`
          SELECT COUNT(*) AS total
          FROM laporan
          WHERE DATE(tanggal) BETWEEN ${dari} AND ${sampai}
        `
      : await sql`
          SELECT COUNT(*) AS total
          FROM laporan
        `;

    const total = Number(countQuery[0]?.total || 0);
    const totalPages = Math.ceil(total / limit);

    // ===== AMBIL DATA =====
    const dataQuery = dari && sampai
      ? await sql`
          SELECT
            id,
            nama,
            id_transaksi,
            jumlah,
            harga,
            tanggal,
            COALESCE(kategori, 'Umum') AS kategori,
            COALESCE(status, 'Selesai') AS status,
            COALESCE(pembayaran, 'Cash') AS pembayaran
          FROM laporan
          WHERE DATE(tanggal) BETWEEN ${dari} AND ${sampai}
          ORDER BY tanggal DESC, id DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      : await sql`
          SELECT
            id,
            nama,
            id_transaksi,
            jumlah,
            harga,
            tanggal,
            COALESCE(kategori, 'Umum') AS kategori,
            COALESCE(status, 'Selesai') AS status,
            COALESCE(pembayaran, 'Cash') AS pembayaran
          FROM laporan
          ORDER BY tanggal DESC, id DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

    return NextResponse.json({
      success: true,
      data: dataQuery,
      total,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (err: any) {
    console.error("Laporan API error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
