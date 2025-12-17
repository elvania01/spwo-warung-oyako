import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    let data;
    
    if (id) {
      // Ambil data spesifik berdasarkan ID
      data = await sql`
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
        WHERE id = ${parseInt(id)}
        LIMIT 1
      `;
      
      if (data.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: `Transaksi dengan ID ${id} tidak ditemukan` 
        }, { status: 404 });
      }
    } else {
      // Ambil semua data
      data = await sql`
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
    }

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
    if (!nama || nama.trim() === "") {
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

    // Validasi dan sanitasi gambarUrl jika ada
    let validGambarUrl = null;
    if (gambarUrl && typeof gambarUrl === 'string' && gambarUrl.trim() !== "") {
      // Cek apakah ini Base64 atau URL biasa
      const isBase64 = gambarUrl.startsWith('data:image/');
      const isUrl = gambarUrl.startsWith('http') || gambarUrl.startsWith('/');
      
      if (isBase64) {
        // Validasi Base64
        const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml);base64,/i;
        if (!base64Regex.test(gambarUrl)) {
          return NextResponse.json({ 
            success: false, 
            error: "Format gambar Base64 tidak valid" 
          }, { status: 400 });
        }
        
        // Validasi ukuran Base64 (maksimal 2MB)
        const base64Data = gambarUrl.replace(/^data:image\/\w+;base64,/, '');
        const fileSize = (base64Data.length * 3) / 4; // Approximate size in bytes
        
        if (fileSize > 2 * 1024 * 1024) { // 2MB
          return NextResponse.json({ 
            success: false, 
            error: "Ukuran gambar terlalu besar. Maksimal 2MB" 
          }, { status: 400 });
        }
        
        validGambarUrl = gambarUrl;
      } else if (isUrl) {
        validGambarUrl = gambarUrl;
      } else {
        return NextResponse.json({ 
          success: false, 
          error: "Format gambar tidak valid. Gunakan Base64 atau URL" 
        }, { status: 400 });
      }
    }

    // Hitung total
    const total = jumlah * harga;

    console.log("Inserting data:", {
      nama,
      kategori,
      jumlah,
      harga,
      tanggal: tanggal || "CURRENT_DATE",
      gambar_url: validGambarUrl,
      total
    });

    // OPTION 1: Insert tanpa kolom total (biarkan database menghitung otomatis)
    try {
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
          ${validGambarUrl}
        )
        RETURNING *
      `;

      console.log("Insert successful:", newItem);

      return NextResponse.json({ 
        success: true, 
        message: "Transaksi berhasil ditambahkan",
        data: newItem
      });
    } catch (insertError: any) {
      // Jika masih error, coba OPTION 2: dengan total tapi sebagai NULL
      console.log("First insert failed, trying alternative...", insertError.message);
      
      try {
        const [newItem] = await sql`
          INSERT INTO pettycash (
            nama,
            kategori,
            jumlah,
            harga,
            tanggal,
            gambar_url,
            total
          ) VALUES (
            ${nama},
            ${kategori},
            ${jumlah},
            ${harga},
            ${tanggal || sql`CURRENT_DATE`},
            ${validGambarUrl},
            ${total}
          )
          RETURNING *
        `;

        return NextResponse.json({ 
          success: true, 
          message: "Transaksi berhasil ditambahkan",
          data: newItem
        });
      } catch (secondError: any) {
        // OPTION 3: Insert tanpa total sama sekali (biarkan default value)
        console.log("Second insert failed, trying without total...", secondError.message);
        
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
            ${validGambarUrl}
          )
          RETURNING *
        `;

        // Update total setelah insert
        await sql`
          UPDATE pettycash 
          SET total = ${total}
          WHERE id = ${newItem.id}
        `;

        // Ambil data yang sudah diupdate
        const [updatedItem] = await sql`
          SELECT * FROM pettycash WHERE id = ${newItem.id}
        `;

        return NextResponse.json({ 
          success: true, 
          message: "Transaksi berhasil ditambahkan",
          data: updatedItem
        });
      }
    }
    
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