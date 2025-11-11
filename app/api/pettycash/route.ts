import { NextRequest } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const role = req.nextUrl.searchParams.get("role") || "";
    const [rows] = await pool.query("SELECT * FROM petty_cash");
    // Kamu bisa filter berdasarkan role jika perlu
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err: any) {
    console.error("Error fetch petty cash:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, kategori, jumlah, harga, tanggal, gambarUrl } = body;
    const [result] = await pool.query(
      "INSERT INTO petty_cash (nama_item, kategori, jumlah, harga, tanggal, gambarUrl) VALUES (?, ?, ?, ?, ?, ?)",
      [nama, kategori, jumlah, harga, tanggal, gambarUrl || "/images/default.jpg"]
    );
    return new Response(JSON.stringify({ message: "Berhasil tambah data", id: (result as any).insertId }), { status: 201 });
  } catch (err: any) {
    console.error("Error tambah petty cash:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "ID diperlukan" }), { status: 400 });

    const body = await req.json();
    const { nama, kategori, jumlah, harga, tanggal, gambarUrl } = body;

    await pool.query(
      "UPDATE petty_cash SET nama_item=?, kategori=?, jumlah=?, harga=?, tanggal=?, gambarUrl=? WHERE id=?",
      [nama, kategori, jumlah, harga, tanggal, gambarUrl, id]
    );
    return new Response(JSON.stringify({ message: "Berhasil update data" }), { status: 200 });
  } catch (err: any) {
    console.error("Error update petty cash:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "ID diperlukan" }), { status: 400 });

    await pool.query("DELETE FROM petty_cash WHERE id=?", [id]);
    return new Response(JSON.stringify({ message: "Berhasil hapus data" }), { status: 200 });
  } catch (err: any) {
    console.error("Error hapus petty cash:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
