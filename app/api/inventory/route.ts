import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT id, nama_item AS nama, kategori, harga FROM inventory");
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error di /api/inventory:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
