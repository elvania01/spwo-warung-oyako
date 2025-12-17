import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: "Tidak ada file yang diupload" 
      }, { status: 400 });
    }

    // Validasi tipe file
    const validTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'image/bmp'
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: "Format file tidak didukung. Gunakan JPEG, PNG, GIF, WebP, atau BMP" 
      }, { status: 400 });
    }

    // Validasi ukuran file (maksimal 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: "Ukuran file terlalu besar. Maksimal 5MB" 
      }, { status: 400 });
    }

    // Buat direktori uploads jika belum ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Buat subdirektori berdasarkan tahun/bulan untuk organisasi yang lebih baik
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dateDir = path.join(uploadDir, year.toString(), month);
    
    if (!existsSync(dateDir)) {
      await mkdir(dateDir, { recursive: true });
    }

    // Generate nama file unik dengan UUID
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = path.join(dateDir, fileName);

    // Konversi File ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Simpan file
    await writeFile(filePath, buffer);

    // Return URL relatif
    const fileUrl = `/uploads/${year}/${month}/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      data: { 
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: filePath
      },
      message: "File berhasil diupload" 
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Terjadi kesalahan saat mengupload file" 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ 
        success: false, 
        error: "URL file harus disertakan" 
      }, { status: 400 });
    }

    // Hapus prefix /uploads/ untuk mendapatkan path relatif
    const relativePath = url.replace(/^\/uploads\//, '');
    const filePath = path.join(process.cwd(), 'public', 'uploads', relativePath);

    // Cek apakah file ada
    if (!existsSync(filePath)) {
      return NextResponse.json({ 
        success: false, 
        error: "File tidak ditemukan" 
      }, { status: 404 });
    }

    // Hapus file
    await unlink(filePath);

    return NextResponse.json({ 
      success: true, 
      message: "File berhasil dihapus"
    });
  } catch (err: any) {
    console.error("Delete file error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Terjadi kesalahan saat menghapus file" 
    }, { status: 500 });
  }
}