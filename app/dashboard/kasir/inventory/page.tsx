'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";
import { Search, Eye } from "lucide-react";

interface Item {
  id: string;
  nama: string;
  kategori: "Makanan" | "Minuman" | "Bahan Pokok";
  tanggalUpdate: string;
  hargaModal: number;
  status: "Update" | "Belum Update";
  pettyCashId: string | null;
}

export default function InventoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua Kategori");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  // Klik di luar dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Data sementara, nanti diganti fetch API Neon
  const dataInventory: Item[] = [
    { id: "ITM001", nama: "Es Batu", kategori: "Minuman", tanggalUpdate: "03-11-2025", hargaModal: 3000, status: "Update", pettyCashId: "PC001" },
    { id: "ITM002", nama: "Gula Pasir", kategori: "Bahan Pokok", tanggalUpdate: "02-11-2025", hargaModal: 14000, status: "Update", pettyCashId: "PC002" },
    { id: "ITM003", nama: "Garam", kategori: "Bahan Pokok", tanggalUpdate: "01-11-2025", hargaModal: 4500, status: "Belum Update", pettyCashId: null },
    { id: "ITM004", nama: "Lada Bubuk", kategori: "Bahan Pokok", tanggalUpdate: "28-10-2025", hargaModal: 28000, status: "Belum Update", pettyCashId: null },
    { id: "ITM005", nama: "Minyak Goreng", kategori: "Bahan Pokok", tanggalUpdate: "30-10-2025", hargaModal: 23000, status: "Update", pettyCashId: "PC005" },
    { id: "ITM006", nama: "Tepung Terigu", kategori: "Bahan Pokok", tanggalUpdate: "01-11-2025", hargaModal: 11000, status: "Belum Update", pettyCashId: null },
    { id: "ITM007", nama: "Telur Ayam", kategori: "Bahan Pokok", tanggalUpdate: "02-11-2025", hargaModal: 26000, status: "Update", pettyCashId: "PC007" },
    { id: "ITM008", nama: "Susu Kental", kategori: "Minuman", tanggalUpdate: "29-10-2025", hargaModal: 13000, status: "Belum Update", pettyCashId: null },
    { id: "ITM009", nama: "Kopi Bubuk", kategori: "Minuman", tanggalUpdate: "01-11-2025", hargaModal: 42000, status: "Update", pettyCashId: "PC009" },
    { id: "ITM010", nama: "Teh Celup", kategori: "Minuman", tanggalUpdate: "27-10-2025", hargaModal: 16000, status: "Belum Update", pettyCashId: null },
    { id: "ITM011", nama: "Nasi Goreng", kategori: "Makanan", tanggalUpdate: "02-11-2025", hargaModal: 13000, status: "Update", pettyCashId: "PC011" },
    { id: "ITM012", nama: "Ayam Goreng", kategori: "Makanan", tanggalUpdate: "01-11-2025", hargaModal: 32000, status: "Belum Update", pettyCashId: null },
  ];

  // Filtered data
  const filteredData = dataInventory.filter(
    item =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedKategori === "Semua Kategori" || item.kategori === selectedKategori)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Update": return "bg-green-100 text-green-800";
      case "Belum Update": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      <SPWONavbar onLogout={handleLogout} />

      <main className="flex-1 ml-60 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-[95%] mx-auto space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Inventori Produk</h1>
              <p className="text-sm text-gray-500">Warung Oyako • {dataInventory.length} item</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-3 rounded-lg shadow flex flex-col sm:flex-row items-center gap-3 border border-gray-100">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="relative w-full sm:w-44" ref={dropdownRef}>
              <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm flex items-center justify-between hover:border-emerald-500 transition-all"
              >
                <span>{selectedKategori}</span>
                <svg
                  className={`w-4 h-4 transition-transform ml-2 ${isOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {["Semua Kategori", "Makanan", "Minuman", "Bahan Pokok"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedKategori(opt);
                        setIsOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm ${
                        selectedKategori === opt ? "bg-emerald-50 text-emerald-700 font-medium" : "hover:bg-emerald-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50 border-b text-gray-800">
                <tr>
                  {["ID Item", "Nama", "Kategori", "Tanggal Update", "Harga Modal", "Status", "Aksi"].map((head) => (
                    <th key={head} className="px-4 py-2 text-left font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-medium">{item.id}</td>
                    <td className="px-4 py-2">{item.nama}</td>
                    <td className="px-4 py-2">{item.kategori}</td>
                    <td className="px-4 py-2 text-center">{item.tanggalUpdate}</td>
                    <td className="px-4 py-2 text-center">Rp {item.hargaModal.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => router.push(`/inventory/${item.id}`)}
                        className="flex items-center justify-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm mx-auto"
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

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 0px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
          html, body { overflow: hidden; }
        `}</style>
      </main>
    </div>
  );
}
