import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM laporan ORDER BY tanggal DESC`;
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nama, id_transaksi, jumlah, harga, tanggal } = await req.json();

    if (!nama || !id_transaksi || jumlah === undefined || harga === undefined || !tanggal) {
      return NextResponse.json({ success: false, error: "Field wajib diisi" }, { status: 400 });
    }

    // ID di-generate di server agar tersimpan di database
    const [newRow] = await sql`
      INSERT INTO laporan (nama, id_transaksi, jumlah, harga, tanggal)
      VALUES (${nama}, ${id_transaksi}, ${jumlah}, ${harga}, ${tanggal})
      RETURNING id
    `;

    return NextResponse.json({ success: true, message: "Berhasil tambah laporan", id: newRow.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
