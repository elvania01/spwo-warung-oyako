import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET() {
  try {
    const data = await sql`
      SELECT 
        id_item,
        nama_produk,
        kategori,
        harga_modal
      FROM inventory
      ORDER BY nama_produk ASC
    `;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Inventory dropdown error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data inventory",
      },
      { status: 500 }
    );
  }
}
