'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";
import { Search, Eye, Upload } from "lucide-react";

/* =========================
   TYPE DEFINITIONS
========================= */
interface Item {
  id_item: string;
  nama_produk: string;
  kategori: "Makanan" | "Minuman" | "Bahan Pokok";
  tanggal_pembelian: string;
  harga_modal: number;
  status: "Update" | "Belum Update";
}

/* =========================
   COMPONENT
========================= */
export default function InventoryPage() {
  const router = useRouter();

  const [inventoryData, setInventoryData] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua Kategori");
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* =========================
     FETCH INVENTORY DATA
  ========================= */
  const fetchInventoryData = async () => {
    try {
      const response = await fetch("/api/inventory");
      if (!response.ok) throw new Error("Fetch failed");
      const data: Item[] = await response.json();
      setInventoryData(data);
    } catch (error) {
      console.error("❌ Fetch inventory error:", error);
    }
  };

  /* =========================
     REALTIME POLLING
  ========================= */
  useEffect(() => {
    fetchInventoryData();
    const interval = setInterval(fetchInventoryData, 5000);
    return () => clearInterval(interval);
  }, []);

  /* =========================
     CLICK OUTSIDE DROPDOWN
  ========================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  /* =========================
     FILTER DATA
  ========================= */
  const filteredData = inventoryData.filter(item =>
    item.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedKategori === "Semua Kategori" || item.kategori === selectedKategori)
  );

  /* =========================
     HELPERS
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  const getStatusColor = (status: Item["status"]) => {
    return status === "Update"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const formatTanggal = (tanggal: string) => {
    const [y, m, d] = tanggal.split("-");
    return `${d}-${m}-${y}`;
  };

  const handleDetail = (item: Item) => {
    sessionStorage.setItem(
      "inventoryDetail",
      JSON.stringify({
        id: item.id_item,
        nama: item.nama_produk,
        kategori: item.kategori,
        hargaModal: item.harga_modal,
        tanggalUpdate: item.tanggal_pembelian,
        status: item.status,
      })
    );
    router.push("/dashboard/inventory/detail");
  };

  /* =========================
     IMPORT CSV
  ========================= */
  const handleImportCSV = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/inventory/import", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        alert("✅ " + result.message);
        fetchInventoryData();
      } catch (err: any) {
        alert("❌ Import gagal: " + err.message);
      }
    };

    input.click();
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      <SPWONavbar onLogout={handleLogout} />

      <main className="flex-1 ml-100 bg-gray-50 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-[95%] mx-auto space-y-4">

          {/* HEADER */}
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Inventori Produk</h1>
              <p className="text-sm text-gray-500">
                Warung Oyako • {inventoryData.length} item
              </p>
            </div>

            <button
              onClick={handleImportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
          </div>

          {/* SEARCH & FILTER */}
          <div className="bg-white p-3 rounded-lg shadow flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div ref={dropdownRef} className="relative w-44">
              <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border rounded-lg px-3 py-2 text-sm flex justify-between"
              >
                {selectedKategori}
              </button>

              {isOpen && (
                <div className="absolute mt-1 w-full bg-white border rounded-lg shadow">
                  {["Semua Kategori", "Makanan", "Minuman", "Bahan Pokok"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedKategori(opt);
                        setIsOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-emerald-50"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2">Kategori</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Harga</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id_item} className="border-t">
                    <td className="px-4 py-2">{item.id_item}</td>
                    <td className="px-4 py-2">{item.nama_produk}</td>
                    <td className="px-4 py-2 text-center">{item.kategori}</td>
                    <td className="px-4 py-2 text-center">{formatTanggal(item.tanggal_pembelian)}</td>
                    <td className="px-4 py-2 text-center">
                      Rp {item.harga_modal.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDetail(item)}
                        className="text-emerald-600 flex gap-1 justify-center"
                      >
                        <Eye className="w-4 h-4" /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
