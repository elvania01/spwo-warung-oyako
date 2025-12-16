
// app/api/inventory/import/route.ts - DEBUG VERSION
import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { broadcastInventoryUpdate } from '../sse/route';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('📁 File received:', file.name, file.size, 'bytes');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Baca file CSV
    const text = await file.text();
    console.log('📄 File content:', text.substring(0, 200)); // Log first 200 chars
    
    const rows = text.split('\n').filter(row => row.trim());
    console.log('📊 Total rows:', rows.length);
    
    if (rows.length < 2) {
      return NextResponse.json(
        { success: false, error: 'File CSV kosong atau format salah' },
        { status: 400 }
      );
    }

    const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = rows.slice(1);
    
    console.log('🏷️ Headers:', headers);
    console.log('📝 Data rows:', dataRows.length);

    // Validasi headers
    const requiredHeaders = ['id_item', 'nama_produk', 'kategori', 'tanggal_pembelian', 'harga_modal', 'status'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Header yang diperlukan: ${missingHeaders.join(', ')}`,
          availableHeaders: headers 
        },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const importedItems = [];
    const errorItems = [];

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2;
      
      try {
        // Skip empty rows
        if (!row.trim()) {
          console.log(`⏭️ Skipping empty row ${rowNumber}`);
          continue;
        }

        console.log(`🔍 Processing row ${rowNumber}:`, row);
        
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        console.log(`📋 Row ${rowNumber} values:`, values);
        
        if (values.length !== headers.length) {
          console.log(`❌ Row ${rowNumber}: Column count mismatch`);
          errorCount++;
          errorItems.push({ 
            row: rowNumber, 
            data: row,
            error: `Jumlah kolom tidak sesuai. Diharapkan: ${headers.length}, Ditemukan: ${values.length}` 
          });
          continue;
        }

        const item = {
          id_item: values[headers.indexOf('id_item')],
          nama_produk: values[headers.indexOf('nama_produk')],
          kategori: values[headers.indexOf('kategori')],
          tanggal_pembelian: values[headers.indexOf('tanggal_pembelian')],
          harga_modal: parseFloat(values[headers.indexOf('harga_modal')]),
          status: values[headers.indexOf('status')]
        };

        console.log(`📦 Row ${rowNumber} parsed item:`, item);

        // Validasi data
        if (!item.id_item || !item.nama_produk || !item.kategori || !item.tanggal_pembelian || isNaN(item.harga_modal) || !item.status) {
          console.log(`❌ Row ${rowNumber}: Data incomplete or invalid`);
          errorCount++;
          errorItems.push({ 
            row: rowNumber, 
            data: item,
            error: 'Data tidak lengkap atau format salah' 
          });
          continue;
        }

        // Check if item exists
        console.log(`🔎 Checking if item exists: ${item.id_item}`);
        const existing = await sql`
          SELECT id_item FROM inventory WHERE id_item = ${item.id_item}
        `;

        console.log(`📊 Existing item check:`, existing);

        let action = 'UPDATE';
        
        if (existing.length > 0) {
          // UPDATE existing item
          console.log(`🔄 Updating existing item: ${item.id_item}`);
          await sql`
            UPDATE inventory 
            SET nama_produk = ${item.nama_produk},
                kategori = ${item.kategori},
                tanggal_pembelian = ${item.tanggal_pembelian},
                harga_modal = ${item.harga_modal},
                status = ${item.status}
            WHERE id_item = ${item.id_item}
          `;
          console.log(`✅ Updated item: ${item.id_item}`);
        } else {
          // INSERT new item
          console.log(`🆕 Inserting new item: ${item.id_item}`);
          await sql`
            INSERT INTO inventory (id_item, nama_produk, kategori, tanggal_pembelian, harga_modal, status)
            VALUES (${item.id_item}, ${item.nama_produk}, ${item.kategori}, ${item.tanggal_pembelian}, ${item.harga_modal}, ${item.status})
          `;
          action = 'CREATE';
          console.log(`✅ Inserted new item: ${item.id_item}`);
        }

        successCount++;
        importedItems.push({ ...item, action, row: rowNumber });
        console.log(`🎯 Successfully processed row ${rowNumber}`);
        
      } catch (error: any) {
        console.error(`💥 Error processing row ${rowNumber}:`, error);
        errorCount++;
        errorItems.push({ 
          row: rowNumber, 
          data: row,
          error: error.message 
        });
      }
    }

    console.log(`📈 Import summary: ${successCount} success, ${errorCount} errors`);

    // ✅ BROADCAST REAL-TIME UPDATE VIA SSE
    if (successCount > 0) {
      broadcastInventoryUpdate('IMPORT', {
        successCount,
        errorCount,
        totalProcessed: successCount + errorCount,
        importedItems: importedItems.slice(0, 10),
        fileName: file.name,
        timestamp: new Date().toISOString()
      });
    }

    // Return response
    const response = {
      success: true,
      message: `Import selesai: ${successCount} berhasil, ${errorCount} gagal`,
      data: {
        successCount,
        errorCount,
        totalProcessed: successCount + errorCount,
        fileName: file.name,
        importedSample: importedItems.slice(0, 3),
        errorSample: errorItems.slice(0, 3),
        summary: {
          created: importedItems.filter(item => item.action === 'CREATE').length,
          updated: importedItems.filter(item => item.action === 'UPDATE').length
        }
      }
    };

    console.log('📤 Final response:', response);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error("💥 Import error:", error);
    
    // ✅ Broadcast error via SSE
    broadcastInventoryUpdate('IMPORT_ERROR', {
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Terjadi kesalahan saat memproses file',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
