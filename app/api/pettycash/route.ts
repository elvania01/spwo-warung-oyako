// app/api/pettycash/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

// ---------------- GET pettycash ----------------
export async function GET(req: NextRequest) {
  try {
    const { page, limit } = Object.fromEntries(req.nextUrl.searchParams.entries()) as {
      page?: string;
      limit?: string;
    };

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const rows = await sql`
      SELECT id, nama, kategori, jumlah, harga, total, tanggal, "gambarUrl"
      FROM pettycash
      ORDER BY tanggal DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const countResult = await sql`SELECT COUNT(*) AS total FROM pettycash`;
    const totalItems = Number(countResult[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: { page: pageNum, limit: limitNum, totalItems, totalPages },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------- POST pettycash ----------------
export async function POST(req: NextRequest) {
  try {
    const { nama, kategori, jumlah, harga, tanggal, "gambarUrl": gambarUrl } = await req.json();

    if (!nama || !kategori || jumlah === undefined || harga === undefined || !tanggal) {
      return NextResponse.json({ success: false, error: "Field wajib diisi" }, { status: 400 });
    }

    const total = jumlah * harga;

    const rows = await sql`
      INSERT INTO pettycash (nama, kategori, jumlah, harga, total, tanggal, "gambarUrl")
      VALUES (${nama}, ${kategori}, ${jumlah}, ${harga}, ${total}, ${tanggal}, ${gambarUrl})
      RETURNING id
    `;

    return NextResponse.json({ success: true, id: rows[0].id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------- PUT pettycash ----------------
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID tidak ditemukan" }, { status: 400 });

    const { nama, kategori, jumlah, harga, tanggal, "gambarUrl": gambarUrl } = await req.json();
    const total = jumlah * harga;

    await sql`
      UPDATE pettycash
      SET nama=${nama}, kategori=${kategori}, jumlah=${jumlah}, harga=${harga}, total=${total}, tanggal=${tanggal}, "gambarUrl"=${gambarUrl}
      WHERE id=${id}
    `;

    return NextResponse.json({ success: true, message: "Updated" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------- DELETE pettycash ----------------
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID tidak ditemukan" }, { status: 400 });

    await sql`DELETE FROM pettycash WHERE id=${id}`;

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
