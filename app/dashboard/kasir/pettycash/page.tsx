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

  // Simulasi data awal sesuai gambar
  useEffect(() => {
    const initialData: PettyCashItem[] = [
      {
        id: 1,
        nama: "Plastik Kemasan",
        kategori: "Overseasmail",
        jumlah: 5,
        harga: 2500,
        tanggal: "2025-12-15",
        gambarUrl: "",
      },
      {
        id: 2,
        nama: "Lada",
        kategori: "Bahun Potok",
        jumlah: 5,
        harga: 2000,
        tanggal: "2025-12-15",
        gambarUrl: "",
      },
      {
        id: 3,
        nama: "Garam",
        kategori: "Bahun Baku",
        jumlah: 20,
        harga: 5000,
        tanggal: "2025-12-13",
        gambarUrl: "",
      },
    ];
    setData(initialData);
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
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));
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

    const newItem = { 
      ...form, 
      id: isEditing ? form.id : Date.now(), 
      gambarUrl: form.gambarUrl || "/images/default.jpg" 
    };

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

  // Hitung total keseluruhan
  const totalKeseluruhan = data.reduce((sum, item) => sum + (item.jumlah * item.harga), 0);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SPWONavbar onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <div className="max-w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Daftar Transaksi Petty Cash</h1>
          </div>

          {/* Form Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {isEditing ? "Edit Data Transaksi" : "Tambah Transaksi Baru"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <select 
                  name="nama" 
                  value={form.nama} 
                  onChange={handleChange} 
                  className="input-field"
                >
                  <option value="">Pilih Produk</option>
                  {produkList.map((p) => (
                    <option key={p.id} value={p.nama}>{p.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input 
                  type="text" 
                  name="kategori" 
                  value={form.kategori} 
                  readOnly 
                  className="input-field bg-gray-50 cursor-not-allowed" 
                  placeholder="Otomatis terisi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <input 
                  type="number" 
                  name="jumlah" 
                  value={form.jumlah} 
                  onChange={handleChange} 
                  min="1"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                <input 
                  type="text" 
                  name="harga" 
                  value={form.harga.toLocaleString("id-ID")} 
                  readOnly 
                  className="input-field bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input 
                  type="date" 
                  name="tanggal" 
                  value={form.tanggal} 
                  onChange={handleChange} 
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar</label>
                <input 
                  type="file" 
                  name="gambarUrl" 
                  accept="image/*" 
                  onChange={handleChange} 
                  className="input-field py-1.5"
                />
              </div>

              <div className="md:col-span-2">
                {form.gambarUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <img 
                      src={form.gambarUrl} 
                      alt="Preview" 
                      className="max-h-32 object-contain rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              className="btn-primary"
            >
              {isEditing ? "Simpan Perubahan" : "Tambah Transaksi"}
            </button>
          </div>

          {/* Tabel Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="pettycash-table-container">
              <table className="pettycash-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME PRODUK</th>
                    <th>KATEGORI</th>
                    <th>JUNLAH</th>
                    <th>HARGA</th>
                    <th>TANGGAL</th>
                    <th>TOTAL</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length ? data.map((item, index) => {
                    const total = item.jumlah * item.harga;
                    const formattedDate = new Date(item.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    });
                    
                    return (
                      <tr key={item.id}>
                        <td>PC{String(item.id).padStart(3, '0')}</td>
                        <td>{item.nama}</td>
                        <td>{item.kategori}</td>
                        <td className="text-center">{item.jumlah}</td>
                        <td className="text-right">Rp {item.harga.toLocaleString("id-ID")}</td>
                        <td>{formattedDate}</td>
                        <td className="text-right font-semibold">
                          Rp {total.toLocaleString("id-ID")}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleDetail(item)} 
                              className="action-btn action-detail"
                            >
                              ▲ Detail
                            </button>
                            <button 
                              onClick={() => handleEdit(item)} 
                              className="action-btn action-edit"
                            >
                              ▼ Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        Belum ada data transaksi petty cash.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Tabel */}
            <div className="table-footer">
              <div className="entries-info">
                Menampilkan {data.length} transaksi
              </div>
              <div className="total-summary">
                <span className="total-label">Total Keseluruhan</span>
                <span className="total-amount">
                  Rp {totalKeseluruhan.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}