"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SPWONavbar from "@/components/SPWOsidebar";
import { useRouter } from "next/navigation";

interface PettyCashItem {
  id: string;
  nama: string;
  kategori: string;
  jumlah: number;
  harga: number;
  tanggal: string;
  gambarUrl: string;
  total: number;
  created_at?: string;
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
    id: "",
    nama: "",
    kategori: "",
    jumlah: 1,
    harga: 0,
    tanggal: new Date().toISOString().split('T')[0],
    gambarUrl: "",
    total: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<"dropdown" | "manual">("dropdown");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const itemsPerPage = 10;

  // Generate unique ID
  const generateUniqueId = (prefix: string = "PC") => {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  };

  // Fetch data dari API
  const fetchDataFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pettycash');
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Filter out any null/undefined items and convert to proper format
          const convertedData: PettyCashItem[] = result.data
            .filter((item: any) => item != null)
            .map((item: any) => ({
              id: item.id?.toString() || generateUniqueId("DB"),
              nama: item.nama || item.nama_produk || "Produk",
              kategori: item.kategori || "Umum",
              jumlah: Number(item.jumlah) || 1,
              harga: parseFloat(item.harga) || 0,
              tanggal: item.tanggal || new Date().toISOString().split('T')[0],
              gambarUrl: item.gambar_url || item.gambarUrl || "",
              total: parseFloat(item.total) || (Number(item.jumlah) || 0) * (parseFloat(item.harga) || 0),
              created_at: item.created_at
            }));
          
          setData(convertedData);
        }
      } else {
        console.error('API response not OK:', response.status);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      // Fallback ke data dummy
      const dummyData: PettyCashItem[] = [
        {
          id: "PC1",
          nama: "Beras Premium",
          kategori: "Bahan Baku",
          jumlah: 5,
          harga: 15000,
          tanggal: "2024-01-15",
          gambarUrl: "",
          total: 75000
        },
        {
          id: "PC2",
          nama: "Minyak Goreng",
          kategori: "Bahan Baku",
          jumlah: 2,
          harga: 25000,
          tanggal: "2024-01-16",
          gambarUrl: "",
          total: 50000
        },
        {
          id: "PC3",
          nama: "Tisu",
          kategori: "Operasional",
          jumlah: 10,
          harga: 10000,
          tanggal: "2024-01-17",
          gambarUrl: "",
          total: 100000
        }
      ];
      setData(dummyData);
    } finally {
      setLoading(false);
    }
  };

  // Upload gambar ke server
  const uploadImageToServer = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              resolve(result.data.url);
            } else {
              reject(new Error(result.error || "Upload gagal"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
          setUploadProgress(0);
        };

        xhr.onerror = () => {
          reject(new Error("Network error"));
          setUploadProgress(0);
        };

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      } catch (error) {
        reject(error);
        setUploadProgress(0);
      }
    });
  };

  // Convert image to Base64 dengan kompresi
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validasi ukuran file (maksimal 2MB untuk Base64)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        // Kompresi jika file terlalu besar
        compressImageForBase64(file).then(resolve).catch(reject);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Kompresi gambar untuk Base64
  const compressImageForBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Atur ukuran maksimal
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          // Resize jika perlu
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image ke canvas
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Konversi ke Base64 dengan kualitas optimal
          const quality = file.size > 1024 * 1024 ? 0.7 : 0.8; // Lebih kecil kualitas untuk file besar
          const base64 = canvas.toDataURL('image/jpeg', quality);
          
          resolve(base64);
        };
        
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      alert('Hanya file gambar (JPEG, PNG, GIF, WebP, BMP) yang diizinkan');
      e.target.value = '';
      return;
    }

    // Tampilkan loading
    setLoading(true);

    try {
      // Pilih metode upload (Base64 atau Server)
      // Untuk demo, kita gunakan Base64. Untuk production, gunakan upload ke server
      const useBase64 = true; // Ganti false untuk upload ke server
      
      let imageUrl = "";
      
      if (useBase64) {
        // Convert ke Base64
        imageUrl = await convertToBase64(file);
      } else {
        // Upload ke server
        imageUrl = await uploadImageToServer(file);
      }
      
      setForm(prev => ({ 
        ...prev, 
        gambarUrl: imageUrl 
      }));
      
      alert('Gambar berhasil diupload!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Gagal upload gambar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Save data ke API
  const saveToAPI = async (formData: PettyCashItem): Promise<boolean> => {
    try {
      const dbData = {
        nama: formData.nama,
        kategori: formData.kategori,
        jumlah: Number(formData.jumlah),
        harga: formData.harga,
        tanggal: formData.tanggal,
        gambarUrl: formData.gambarUrl || null // Simpan Base64 atau URL
      };

      console.log("Saving to API:", dbData);

      const response = await fetch('/api/pettycash', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dbData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchDataFromAPI();
        return true;
      } else {
        throw new Error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error('Gagal menyimpan:', error);
      alert(`Gagal menyimpan data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  // Delete data dari API
  const deleteFromAPI = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/pettycash?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Jika ada gambar di server, hapus juga
        const item = data.find(d => d.id === id);
        if (item?.gambarUrl && item.gambarUrl.startsWith('/uploads/')) {
          try {
            await fetch('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: item.gambarUrl })
            });
          } catch (error) {
            console.error('Gagal menghapus file gambar:', error);
          }
        }
        
        await fetchDataFromAPI();
        return true;
      } else {
        throw new Error(result.error || "Gagal menghapus data");
      }
    } catch (error) {
      console.error('Gagal menghapus:', error);
      alert(`Gagal menghapus data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  useEffect(() => {
    // Fetch produk dari API atau gunakan data dummy
    const fetchProduk = async () => {
      try {
        const response = await fetch('/api/produk');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setProdukList(result.data);
            return;
          }
        }
      } catch (error) {
        console.log('Gagal fetch produk, menggunakan data dummy');
      }
      
      // Fallback ke data dummy
      const produkDummy: Produk[] = [
        { id: 1, nama: "Es Batu", kategori: "Bahan Baku", harga: 20000 },
        { id: 2, nama: "Tisu", kategori: "Operasional", harga: 10000 },
        { id: 3, nama: "Garam", kategori: "Bahan Baku", harga: 5000 },
        { id: 4, nama: "Lada", kategori: "Bahan Baku", harga: 3000 },
        { id: 5, nama: "Plastik Kemasan", kategori: "Operasional", harga: 2500 },
        { id: 6, nama: "Beras Premium", kategori: "Bahan Baku", harga: 15000 },
        { id: 7, nama: "Minyak Goreng", kategori: "Bahan Baku", harga: 25000 },
        { id: 8, nama: "Gula Pasir", kategori: "Bahan Baku", harga: 12000 },
        { id: 9, nama: "Kopi Bubuk", kategori: "Bahan Baku", harga: 18000 },
        { id: 10, nama: "Sabun Cuci", kategori: "Operasional", harga: 8000 },
      ];
      setProdukList(produkDummy);
    };

    fetchProduk();
    fetchDataFromAPI();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("isLoggedIn");
    router.push("/autentikasi/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "nama" && inputMode === "dropdown") {
      const produkTerpilih = produkList.find((p) => p.nama === value);
      if (produkTerpilih) {
        setForm((prev) => ({
          ...prev,
          nama: value,
          kategori: produkTerpilih.kategori,
          harga: produkTerpilih.harga,
          total: Number(prev.jumlah) * produkTerpilih.harga
        }));
      }
    } else if (name === "nama") {
      setForm((prev) => ({ ...prev, nama: value }));
    } else if (name === "jumlah") {
      const jumlah = value === "" ? 1 : Math.max(Number(value), 1);
      setForm((prev) => ({ 
        ...prev, 
        jumlah,
        total: jumlah * prev.harga
      }));
    } else if (name === "harga") {
      const harga = value === "" ? 0 : Math.max(Number(value), 0);
      setForm((prev) => ({ 
        ...prev, 
        harga,
        total: Number(prev.jumlah) * harga
      }));
    } else if (name === "kategori") {
      setForm((prev) => ({ ...prev, kategori: value }));
    } else if (name === "tanggal") {
      setForm((prev) => ({ ...prev, tanggal: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const switchInputMode = (mode: "dropdown" | "manual") => {
    setInputMode(mode);
    setForm({
      id: "",
      nama: "",
      kategori: "",
      jumlah: 1,
      harga: 0,
      tanggal: new Date().toISOString().split('T')[0],
      gambarUrl: "",
      total: 0
    });
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.kategori || !form.tanggal) {
      alert("Harap lengkapi semua kolom yang diperlukan!");
      return;
    }

    if (form.harga <= 0 || Number(form.jumlah) <= 0) {
      alert("Harga dan jumlah harus lebih dari 0!");
      return;
    }

    setLoading(true);
    
    try {
      const success = await saveToAPI(form);
      if (success) {
        setForm({
          id: "",
          nama: "",
          kategori: "",
          jumlah: 1,
          harga: 0,
          tanggal: new Date().toISOString().split('T')[0],
          gambarUrl: "",
          total: 0
        });
        setIsEditing(false);
        setInputMode("dropdown");
        alert("Data berhasil disimpan!");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: PettyCashItem) => {
    setForm({
      ...item,
      jumlah: Number(item.jumlah)
    });
    setIsEditing(true);
    setInputMode("manual");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    
    setLoading(true);
    try {
      const success = await deleteFromAPI(id);
      if (!success) {
        // Fallback: hapus dari local state jika API gagal
        setData((prev) => prev.filter((item) => item.id !== id));
      }
      alert("Data berhasil dihapus!");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (item: PettyCashItem) => {
    // Simpan ke sessionStorage untuk halaman detail
    sessionStorage.setItem("pettyCashDetail", JSON.stringify(item));
    
    // Navigasi ke halaman detail dengan ID sebagai parameter
    router.push(`/dashboard/pettycash/detail?id=${item.id}`);
  };

  // Safe filtering function
  const filteredData = data.filter(item => {
    if (!item) return false;
    
    const safeLower = (value: any): string => {
      if (value == null) return "";
      if (typeof value === 'string') return value.toLowerCase();
      if (typeof value === 'number' || typeof value === 'boolean') return value.toString().toLowerCase();
      try {
        return String(value).toLowerCase();
      } catch {
        return "";
      }
    };

    const nama = safeLower(item.nama);
    const kategori = safeLower(item.kategori);
    const id = safeLower(item.id);
    const search = searchTerm.toLowerCase();
    
    return nama.includes(search) || 
           kategori.includes(search) || 
           id.includes(search);
  });

  const totalKeseluruhan = filteredData.reduce((sum, item) => sum + (item?.total || 0), 0);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <SPWONavbar onLogout={handleLogout} />
      
      <main className="flex-1 ml-64 p-4 overflow-y-auto">
        {/* Header - Lebih kompak */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">Petty Cash</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola pengeluaran operasional harian</p>
        </div>

        {/* Search Bar - Lebih kecil */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent w-full"
            />
            <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {filteredData.length} transaksi
          </div>
        </div>

        {/* Stats Cards - Lebih kecil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Transaksi</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{filteredData.length}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600">📊</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Pengeluaran</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">Rp {totalKeseluruhan.toLocaleString("id-ID")}</p>
              </div>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Rata-rata</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">
                  Rp {filteredData.length > 0 ? (totalKeseluruhan / filteredData.length).toLocaleString("id-ID", {maximumFractionDigits: 0}) : "0"}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section - Lebih kompak */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800 mb-2 sm:mb-0">
              {isEditing ? "✏️ Edit Data" : "➕ Tambah Data Baru"}
            </h2>
            
            {!isEditing && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => switchInputMode("dropdown")}
                  className={`px-3 py-1 rounded text-xs ${
                    inputMode === "dropdown" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  📦 Pilih
                </button>
                <button
                  onClick={() => switchInputMode("manual")}
                  className={`px-3 py-1 rounded text-xs ${
                    inputMode === "manual" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ✍️ Manual
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar untuk Upload */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Mengupload gambar...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Form Grid - Lebih rapat */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Nama Produk */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {inputMode === "dropdown" ? "Pilih Produk *" : "Nama Produk *"}
              </label>
              {inputMode === "dropdown" ? (
                <select 
                  name="nama" 
                  value={form.nama} 
                  onChange={handleChange} 
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Pilih --</option>
                  {produkList.map((p) => (
                    <option key={p.id} value={p.nama}>
                      {p.nama} - Rp {p.harga.toLocaleString()}
                    </option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  name="nama" 
                  value={form.nama} 
                  onChange={handleChange} 
                  placeholder="Nama produk" 
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              )}
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kategori *
              </label>
              {inputMode === "dropdown" ? (
                <input 
                  type="text" 
                  name="kategori" 
                  value={form.kategori} 
                  readOnly 
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <select 
                  name="kategori" 
                  value={form.kategori} 
                  onChange={handleChange} 
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Pilih --</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="ATK">ATK</option>
                  <option value="Peralatan">Peralatan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              )}
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jumlah *
              </label>
              <input 
                type="number" 
                name="jumlah" 
                min="1"
                value={form.jumlah} 
                onChange={handleChange} 
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            {/* Harga */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Harga *
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  Rp
                </span>
                <input 
                  type="number" 
                  name="harga" 
                  min="0"
                  step="500"
                  value={form.harga || ""} 
                  onChange={handleChange}
                  readOnly={inputMode === "dropdown"}
                  className={`w-full px-3 py-1.5 pl-7 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${
                    inputMode === "dropdown" ? "bg-gray-50" : ""
                  }`}
                  required
                />
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tanggal *
              </label>
              <input 
                type="date" 
                name="tanggal" 
                value={form.tanggal} 
                onChange={handleChange} 
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            {/* Total */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Total
              </label>
              <div className="w-full px-3 py-1.5 text-sm border border-emerald-200 bg-emerald-50 rounded text-emerald-700 font-semibold">
                Rp {form.total.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* Upload Gambar - Lebih lengkap */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Bukti Pembelian (Opsional)
            </label>
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors bg-gray-50">
              <input 
                type="file" 
                id="file-upload"
                name="gambarUrl" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden"
                disabled={loading}
              />
              <label htmlFor="file-upload" className={`cursor-pointer block ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-emerald-600 text-xl">📎</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {form.gambarUrl ? "✅ File terpilih" : "Klik untuk upload gambar"}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Seret & lepas atau klik untuk memilih file
                  </p>
                  <p className="text-xs text-gray-400">
                    Maksimal 2MB • Format: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </label>
            </div>
            
            {form.gambarUrl && (
              <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600 mb-2 font-medium">Preview:</p>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="relative w-24 h-24 border rounded-lg overflow-hidden flex-shrink-0">
                    {form.gambarUrl.startsWith('data:image/') || form.gambarUrl.startsWith('http') || form.gambarUrl.startsWith('/') ? (
                      <img 
                        src={form.gambarUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">📷</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          if (form.gambarUrl.startsWith('http') || form.gambarUrl.startsWith('/') || form.gambarUrl.startsWith('data:image/')) {
                            window.open(form.gambarUrl, '_blank');
                          }
                        }}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center gap-1 w-fit"
                        disabled={!form.gambarUrl.startsWith('http') && !form.gambarUrl.startsWith('/') && !form.gambarUrl.startsWith('data:image/')}
                      >
                        <span>👁</span> Lihat Full
                      </button>
                      <button 
                        onClick={() => setForm(prev => ({ ...prev, gambarUrl: "" }))}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center gap-1 w-fit"
                      >
                        <span>🗑</span> Hapus Gambar
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {form.gambarUrl.length > 100 ? 
                        "Gambar tersimpan (Base64)" : 
                        form.gambarUrl.startsWith('/uploads/') ? 
                        "Gambar tersimpan di server" : 
                        "Gambar URL"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  switchInputMode("dropdown");
                }}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors border border-gray-300"
                disabled={loading}
              >
                Batal
              </button>
            )}
            <button 
              onClick={handleSubmit} 
              className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : isEditing ? (
                <>
                  <span>💾</span> Simpan Perubahan
                </>
              ) : (
                <>
                  <span>➕</span> Tambah Transaksi
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Data Table Section */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-bold text-gray-800 mb-1 sm:mb-0">
              📋 Daftar Transaksi
            </h2>
            <div className="text-xs text-gray-600">
              Total: Rp {totalKeseluruhan.toLocaleString("id-ID")}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase">
                        ID
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase">
                        Produk
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase">
                        Kategori
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase">
                        Jml
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase">
                        Harga
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase">
                        Tanggal
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase">
                        Total
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentData.length > 0 ? (
                      currentData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-500 text-xs">
                            {item.id.length > 8 ? `${item.id.substring(0, 8)}...` : item.id}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 text-xs">
                            <div className="flex items-center gap-2">
                              {item.nama}
                              {item.gambarUrl && (
                                <span className="text-blue-500" title="Ada gambar">📷</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.kategori === "Operasional" ? "bg-blue-100 text-blue-800" :
                              item.kategori === "Bahan Baku" ? "bg-green-100 text-green-800" :
                              item.kategori === "ATK" ? "bg-purple-100 text-purple-800" :
                              item.kategori === "Peralatan" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {item.kategori}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                            {item.jumlah}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                            Rp {item.harga.toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                            {new Date(item.tanggal).toLocaleDateString("id-ID", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-semibold text-emerald-700 text-xs">
                            Rp {item.total.toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDetail(item)}
                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs"
                                title="Detail"
                              >
                                👁
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors text-xs"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs"
                                title="Hapus"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center">
                          <div className="flex flex-col items-center text-gray-500">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                              📄
                            </div>
                            <p className="text-xs font-medium mb-1">Belum ada data transaksi</p>
                            <p className="text-xs">Mulai dengan menambahkan data baru</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredData.length > itemsPerPage && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ←
                      </button>
                      <span className="px-2 py-1 text-xs text-gray-700">
                        {currentPage}/{totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Total {filteredData.length} transaksi • Total pengeluaran: Rp {totalKeseluruhan.toLocaleString("id-ID")}</p>
          <p className="mt-1">Gambar disimpan sebagai Base64 di database • Maksimal 2MB per gambar</p>
        </div>
      </main>
    </div>
  );
}