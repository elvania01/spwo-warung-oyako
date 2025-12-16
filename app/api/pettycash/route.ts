import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Ambil semua data pettycash
    const data = await sql`
      SELECT 
        id,
        nama,
        kategori,
        jumlah,
        harga,
        tanggal,
        total,
        gambar_url,
        created_at
      FROM pettycash
      ORDER BY tanggal DESC, id DESC
    `;

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: "Data berhasil diambil"
    });
  } catch (err: any) {
    console.error("GET pettycash error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Gagal mengambil data petty cash"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nama,
      kategori = "Umum",
      jumlah = 1,
      harga = 0,
      tanggal,
      gambarUrl
    } = body;

    // Validasi input
    if (!nama) {
      return NextResponse.json({ 
        success: false, 
        error: "Nama produk harus diisi" 
      }, { status: 400 });
    }

    if (jumlah <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Jumlah harus lebih dari 0" 
      }, { status: 400 });
    }

    if (harga < 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Harga tidak boleh negatif" 
      }, { status: 400 });
    }

    // Insert data ke database
    const [newItem] = await sql`
      INSERT INTO pettycash (
        nama,
        kategori,
        jumlah,
        harga,
        tanggal,
        gambar_url
      ) VALUES (
        ${nama},
        ${kategori},
        ${jumlah},
        ${harga},
        ${tanggal || sql`CURRENT_DATE`},
        ${gambarUrl || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      message: "Transaksi berhasil ditambahkan",
      data: newItem
    });
  } catch (err: any) {
    console.error("POST pettycash error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Terjadi kesalahan saat menambahkan transaksi"
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "ID transaksi harus disertakan" 
      }, { status: 400 });
    }

    // Hapus data
    const [deletedItem] = await sql`
      DELETE FROM pettycash 
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!deletedItem) {
      return NextResponse.json({ 
        success: false, 
        error: "Transaksi tidak ditemukan" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Transaksi berhasil dihapus",
      data: deletedItem
    });
  } catch (err: any) {
    console.error("DELETE pettycash error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}