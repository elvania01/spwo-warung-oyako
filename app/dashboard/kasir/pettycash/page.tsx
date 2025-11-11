"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";

interface PettyCashItem {
  id: number;
  nama: string;
  kategori: string;
  jumlah: number;
  harga: number;
  tanggal: string;
  gambarUrl: string;
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
    jumlah: 1,
    harga: 0,
    tanggal: "",
    gambarUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // 🔒 Cek login
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) router.replace("/autentikasi/login");
  }, [router]);

  // Ambil daftar produk dari DB (Neon) → sementara hardcoded dulu
  useEffect(() => {
    const fetchProduk = async () => {
      // nanti bisa diganti fetch('/api/produk') dari Neon
      const produkDariDB: Produk[] = [
        { id: 1, nama: "Es Batu", kategori: "Bahan Baku", harga: 20000 },
        { id: 2, nama: "Tisu", kategori: "Operasional", harga: 10000 },
        { id: 3, nama: "Garam", kategori: "Bahan Baku", harga: 5000 },
        { id: 4, nama: "Lada", kategori: "Bahan Baku", harga: 3000 },
        { id: 5, nama: "Plastik Kemasan", kategori: "Operasional", harga: 2500 },
      ];
      setProdukList(produkDariDB);
    };

    fetchProduk();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/autentikasi/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "nama") {
      const produkTerpilih = produkList.find((p) => p.nama === value);
      if (produkTerpilih) {
        setForm((prev) => ({
          ...prev,
          nama: produkTerpilih.nama,
          kategori: produkTerpilih.kategori,
          harga: produkTerpilih.harga,
        }));
      }
    } else if (name === "jumlah") {
      setForm((prev) => ({ ...prev, jumlah: Math.max(Number(value), 1) }));
    } else if (name === "gambarUrl" && files?.[0]) {
      const fileUrl = URL.createObjectURL(files[0]);
      setForm((prev) => ({ ...prev, gambarUrl: fileUrl }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (!form.nama || !form.kategori || !form.tanggal) {
      return alert("Lengkapi semua kolom!");
    }

    const newItem = { ...form, id: isEditing ? form.id : Date.now(), gambarUrl: form.gambarUrl || "/images/default.jpg" };

    if (isEditing) {
      setData((prev) => prev.map((item) => (item.id === form.id ? newItem : item)));
      setIsEditing(false);
    } else {
      setData((prev) => [...prev, newItem]);
    }

    setForm({ id: 0, nama: "", kategori: "", jumlah: 1, harga: 0, tanggal: "", gambarUrl: "" });
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

  const handleDetail = (item: PettyCashItem) => {
    sessionStorage.setItem("pettyCashDetail", JSON.stringify(item));
    router.push("/dashboard/pettycash/detail");
  };

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
              <select name="nama" value={form.nama} onChange={handleChange} className="border p-2 rounded w-full">
                <option value="">Pilih Produk</option>
                {produkList.map((p) => (
                  <option key={p.id} value={p.nama}>{p.nama}</option>
                ))}
              </select>

              <input type="text" name="kategori" value={form.kategori} readOnly placeholder="Kategori Otomatis" className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed" />

              <input type="number" name="jumlah" value={form.jumlah} onChange={handleChange} placeholder="Jumlah" className="border p-2 rounded w-full" />

              <input type="number" name="harga" value={form.harga} readOnly placeholder="Harga Otomatis" className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed" />

              <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className="border p-2 rounded w-full" />

              <input type="file" name="gambarUrl" accept="image/*" onChange={handleChange} className="border p-2 rounded w-full" />
              {form.gambarUrl && <img src={form.gambarUrl} alt="Preview" className="mt-2 max-h-32 object-contain rounded-lg" />}
            </div>

            <button onClick={handleSubmit} className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition">
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
                {data.length ? data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.nama}</td>
                    <td className="p-3">{item.kategori}</td>
                    <td className="p-3">{item.jumlah}</td>
                    <td className="p-3">Rp {item.harga.toLocaleString("id-ID")}</td>
                    <td className="p-3">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="p-3">Rp {(item.jumlah * item.harga).toLocaleString("id-ID")}</td>
                    <td className="p-3 flex gap-2 justify-center">
                      <button onClick={() => handleDetail(item)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Detail</button>
                      <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">✎</button>
                      <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">🗑</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">Belum ada data petty cash.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
