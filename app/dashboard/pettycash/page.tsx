"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/SPWOsidebar";

interface PettyCashItem {
  id: number;
  nama: string;
  kategori: string;
  jumlah: number;
  harga: number;
  tanggal: string;
}

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
}

export default function PettyCashPage() {
  const router = useRouter();

  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [data, setData] = useState<PettyCashItem[]>([]);
  const [form, setForm] = useState<PettyCashItem>({
    id: 0,
    nama: "",
    kategori: "",
    jumlah: 0,
    harga: 0,
    tanggal: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const produkDariDB: Produk[] = [
      { id: 1, nama: "Es Batu", kategori: "Bahan Baku", harga: 20000 },
      { id: 2, nama: "Tisu", kategori: "Operasional", harga: 10000 },
      { id: 3, nama: "Garam", kategori: "Bahan Baku", harga: 5000 },
      { id: 4, nama: "Lada", kategori: "Bahan Baku", harga: 3000 },
      { id: 5, nama: "Plastik Kemasan", kategori: "Operasional", harga: 2500 },
    ];
    setProdukList(produkDariDB);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/autentikasi/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "nama") {
      const produkTerpilih = produkList.find((p) => p.nama === value);
      if (produkTerpilih) {
        setForm((prev) => ({
          ...prev,
          nama: value,
          kategori: produkTerpilih.kategori,
          harga: produkTerpilih.harga,
        }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "jumlah" || name === "harga" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = () => {
    if (!form.nama || !form.kategori || !form.tanggal) {
      return alert("Lengkapi semua kolom!");
    }

    if (isEditing) {
      setData((prev) => prev.map((item) => (item.id === form.id ? form : item)));
      setIsEditing(false);
    } else {
      setData((prev) => [...prev, { ...form, id: Date.now() }]);
    }

    setForm({ id: 0, nama: "", kategori: "", jumlah: 0, harga: 0, tanggal: "" });
  };

  const handleEdit = (item: PettyCashItem) => {
    setForm(item);
    setIsEditing(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus data ini?")) {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar onLogout={handleLogout} activePage="Petty Cash" />

      {/* Konten utama */}
      <main className="flex-1 ml-60 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Petty Cash
          </h2>

          {/* Form Input */}
          <div className="bg-white shadow rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Data" : "Tambah Data"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Pilih Produk</option>
                {produkList.map((p) => (
                  <option key={p.id} value={p.nama}>
                    {p.nama}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="kategori"
                value={form.kategori}
                readOnly
                placeholder="Kategori Otomatis"
                className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
              />

              <input
                type="number"
                name="jumlah"
                value={form.jumlah}
                onChange={handleChange}
                placeholder="Jumlah"
                className="border p-2 rounded w-full"
              />

              <input
                type="number"
                name="harga"
                value={form.harga}
                readOnly
                placeholder="Harga Otomatis"
                className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
              />

              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
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
                  <th className="p-3 font-semibold">Tanggal Pembelian</th>
                  <th className="p-3 font-semibold">Total</th>
                  <th className="p-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.nama}</td>
                    <td className="p-3">{item.kategori}</td>
                    <td className="p-3">{item.jumlah}</td>
                    <td className="p-3">Rp. {item.harga.toLocaleString("id-ID")}</td>
                    <td className="p-3">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="p-3">
                      Rp. {(item.jumlah * item.harga).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
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
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Belum ada data petty cash.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
