import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET() {
  try {
    console.log("🔗 Fetching inventory from database...");
    
    // ✅ QUERY SANGAT SIMPLE - tanpa created_at
    const data = await sql`
      SELECT 
        id_item,
        nama_produk,
        kategori,
        tanggal_pembelian,
        harga_modal,
        status
      FROM inventory 
      ORDER BY tanggal_pembelian DESC
    `;
    
    console.log(`✅ Successfully fetched ${data.length} items`);
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("❌ GET API Error:", error.message);
    // ✅ RETURN EMPTY ARRAY JIKA ERROR
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { id_item, nama_produk, kategori, tanggal_pembelian, harga_modal, status } = await request.json();
    
    // Check if exists
    const existing = await sql`
      SELECT id_item FROM inventory WHERE id_item = ${id_item}
    `;
    
    let result;
    if (existing.length > 0) {
      // UPDATE
      result = await sql`
        UPDATE inventory 
        SET nama_produk = ${nama_produk}, 
            kategori = ${kategori}, 
            tanggal_pembelian = ${tanggal_pembelian},
            harga_modal = ${harga_modal},
            status = ${status}
        WHERE id_item = ${id_item}
        RETURNING *
      `;
      console.log(`🔄 Updated: ${id_item}`);
    } else {
      // INSERT
      result = await sql`
        INSERT INTO inventory 
        (id_item, nama_produk, kategori, tanggal_pembelian, harga_modal, status)
        VALUES (${id_item}, ${nama_produk}, ${kategori}, ${tanggal_pembelian}, ${harga_modal}, ${status})
        RETURNING *
      `;
      console.log(`🆕 Created: ${id_item}`);
    }
    
    return NextResponse.json({ success: true, data: result[0] });
    
  } catch (error: any) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
