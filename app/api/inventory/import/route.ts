import { NextRequest, NextResponse } from "next/server";
import sql from "@/app/lib/db";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    let records: any[] = [];

    if (fileName.endsWith(".csv")) {
      const text = new TextDecoder().decode(buffer);
      records = Papa.parse(text, { header: true, skipEmptyLines: true }).data as any[];
    } else if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return NextResponse.json({ success: false, message: "Format file tidak didukung" }, { status: 400 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const row of records) {
      const { id, nama, kategori_id, harga_modal, status, deskripsi } = row;

      if (!nama || !kategori_id || !harga_modal || !status) {
        failCount++;
        continue; // skip invalid
      }

      try {
        await sql`
          INSERT INTO inventory (nama, kategori_id, harga_modal, status, deskripsi)
          VALUES (${nama}, ${Number(kategori_id)}, ${Number(harga_modal)}, ${status}, ${deskripsi || null})
          ON CONFLICT (id) DO UPDATE
          SET nama = EXCLUDED.nama,
              kategori_id = EXCLUDED.kategori_id,
              harga_modal = EXCLUDED.harga_modal,
              status = EXCLUDED.status,
              deskripsi = EXCLUDED.deskripsi;
        `;
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import selesai. Berhasil: ${successCount}, Gagal: ${failCount}`,
    });
  } catch (error) {
    console.error("Inventory import error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
