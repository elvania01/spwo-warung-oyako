"use client";

import { useEffect, useState } from "react";

interface InventoryItem {
  id: string;
  nama: string;
  kategori_id: number;
  harga_modal: number;
  status: string;
  deskripsi: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });

  const fetchInventory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?page=${page}&limit=${pagination.limit}`);
      const data = await res.json();
      setInventory(data.data || []);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/inventory/import", { method: "POST", body: formData });
      const data = await res.json();
      alert(data.message || "Import selesai");
      setFile(null);
      fetchInventory(1); // refresh data
    } finally {
      setUploading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchInventory(newPage);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      <div className="mb-4 flex items-center gap-2">
        <input type="file" accept=".csv,.xls,.xlsx" onChange={e => setFile(e.target.files?.[0] || null)} className="border p-1 rounded"/>
        <button onClick={handleUpload} disabled={!file || uploading} className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50">
          {uploading ? "Uploading..." : "Import File"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-md table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Nama</th>
              <th className="border px-2 py-1">Kategori ID</th>
              <th className="border px-2 py-1">Harga Modal</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">Tidak ada data inventory</td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{item.nama}</td>
                  <td className="border px-2 py-1">{item.kategori_id}</td>
                  <td className="border px-2 py-1">{item.harga_modal}</td>
                  <td className="border px-2 py-1">{item.status}</td>
                  <td className="border px-2 py-1">{item.deskripsi || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-center items-center mt-4 gap-2">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded ${pagination.page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
