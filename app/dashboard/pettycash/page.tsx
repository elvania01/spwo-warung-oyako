"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";

interface InventoryItem {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
}

interface PettyCashItem {
  id: number;
  nama: string;
  kategori: string;
  jumlah: number;
  harga: number;
  tanggal: string;
  gambarUrl: string;
}

export default function PettyCashPage() {
  const router = useRouter();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [data, setData] = useState<PettyCashItem[]>([]);
  const [form, setForm] = useState<PettyCashItem>({
    id: 0,
    nama: "",
    kategori: "",
    jumlah: 1,
    harga: 0,
    tanggal: "",
    gambarUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ---------------- Fetch Inventory & PettyCash ----------------
  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      const result = await res.json();
      if (result.success) setInventory(result.data);
    } catch (err) {
      console.error("Gagal fetch inventory", err);
    }
  };

  const fetchPettyCash = async (pageNum = page, limitNum = limit) => {
    try {
      const res = await fetch(`/api/pettycash?page=${pageNum}&limit=${limitNum}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setPage(result.pagination.page);
        setLimit(result.pagination.limit);
        setTotalPages(result.pagination.totalPages);
      } else {
        console.error("Error fetch petty cash:", result.error);
      }
    } catch (err) {
      console.error("Fetch petty cash failed:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchPettyCash();
  }, []);

  // ---------------- Logout ----------------
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/autentikasi/login");
  };

  // ---------------- Form Handling ----------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "nama") {
      const selected = inventory.find((p) => p.nama === value);
      if (selected) {
        setForm((prev) => ({
          ...prev,
          nama: value,
          kategori: selected.kategori,
          harga: selected.harga,
        }));
      } else {
        setForm((prev) => ({ ...prev, nama: value, kategori: "", harga: 0 }));
      }
    } else if (name === "jumlah" || name === "harga") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else if (name === "kategori") {
      setForm((prev) => ({ ...prev, kategori: value }));
    } else if (name === "gambarUrl" && files?.[0]) {
      const fileUrl = URL.createObjectURL(files[0]);
      setForm((prev) => ({ ...prev, gambarUrl: fileUrl }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.kategori || !form.tanggal || !form.harga) {
      return alert("Lengkapi semua kolom!");
    }
    if (!form.gambarUrl) form.gambarUrl = "/images/default.jpg";

    try {
      if (isEditing) {
        await fetch(`/api/pettycash?id=${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setIsEditing(false);
      } else {
        const res = await fetch("/api/pettycash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || "Gagal menambah data");
      }
      setForm({ id: 0, nama: "", kategori: "", jumlah: 1, harga: 0, tanggal: "", gambarUrl: "" });
      fetchPettyCash(page, limit);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menyimpan data");
    }
  };

  const handleEdit = (item: PettyCashItem) => {
    setForm(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin hapus data ini?")) {
      try {
        await fetch(`/api/pettycash?id=${id}`, { method: "DELETE" });
        fetchPettyCash(page, limit);
      } catch (err) {
        console.error(err);
        alert("Gagal menghapus data");
      }
    }
  };

  const handleDetail = (item: PettyCashItem) => {
    if (!item.gambarUrl) item.gambarUrl = "/images/default.jpg";
    sessionStorage.setItem("pettyCashDetail", JSON.stringify(item));
    router.push("/dashboard/pettycash/detail");
  };

  // ---------------- Pagination ----------------
  const handlePrevPage = () => {
    if (page > 1) fetchPettyCash(page - 1, limit);
  };
  const handleNextPage = () => {
    if (page < totalPages) fetchPettyCash(page + 1, limit);
  };

  // ---------------- Render ----------------
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <SPWONavbar onLogout={handleLogout} />
      <main className="flex-1 ml-60 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Petty Cash</h2>

          {/* Form Input */}
          <div className="bg-white shadow rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">{isEditing ? "Edit Data" : "Tambah Data"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                list="inventoryList"
                name="nama"
                value={form.nama || ""}
                onChange={handleChange}
                placeholder="Pilih atau ketik nama produk"
                className="border p-2 rounded w-full"
              />
              <datalist id="inventoryList">
                {inventory.map((p) => (
                  <option key={p.id} value={p.nama} />
                ))}
              </datalist>

              <input
                type="text"
                name="kategori"
                value={form.kategori || ""}
                onChange={handleChange}
                placeholder="Kategori"
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                name="jumlah"
                value={form.jumlah ?? 1}
                onChange={handleChange}
                placeholder="Jumlah"
                className="border p-2 rounded w-full"
                min={1}
              />
              <input
                type="number"
                name="harga"
                value={form.harga ?? 0}
                onChange={handleChange}
                placeholder="Harga"
                className="border p-2 rounded w-full"
                min={0}
              />
              <input
                type="date"
                name="tanggal"
                value={form.tanggal || ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="file"
                name="gambarUrl"
                accept="image/*"
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              {form.gambarUrl && (
                <img
                  src={form.gambarUrl}
                  alt="Preview"
                  className="mt-2 max-h-32 object-contain rounded-lg"
                />
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition"
            >
              {isEditing ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>

          {/* Tabel Data */}
          <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="p-3 font-semibold">Nama Produk</th>
                  <th className="p-3 font-semibold">Kategori</th>
                  <th className="p-3 font-semibold">Jumlah</th>
                  <th className="p-3 font-semibold">Harga</th>
                  <th className="p-3 font-semibold">Tanggal</th>
                  <th className="p-3 font-semibold">Total</th>
                  <th className="p-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0
                  ? data.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{item.nama}</td>
                        <td className="p-3">{item.kategori}</td>
                        <td className="p-3">{item.jumlah}</td>
                        <td className="p-3">Rp {item.harga.toLocaleString("id-ID")}</td>
                        <td className="p-3">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                        <td className="p-3">Rp {(item.jumlah * item.harga).toLocaleString("id-ID")}</td>
                        <td className="p-3 flex gap-2 justify-center">
                          <button
                            onClick={() => handleDetail(item)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-gray-500">
                          Belum ada data petty cash.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
