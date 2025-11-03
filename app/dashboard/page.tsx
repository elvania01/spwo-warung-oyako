"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [periode, setPeriode] = useState<"Harian" | "Mingguan" | "Bulanan">(
    "Harian"
  );

  // 🔒 Cek login user
  useEffect(() => {
    if (typeof window === "undefined") return;

    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/autentikasi/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/autentikasi/login");
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Memeriksa sesi login...</p>
      </div>
    );
  }

  const dataRingkasan = [
    { label: "Total Pengeluaran", value: "Rp 12.500.000" },
    { label: "Sisa Saldo", value: "Rp 7.500.000" },
    { label: "Transaksi Bulan Ini", value: "28" },
    { label: "Pengajuan Pending", value: "3" },
  ];

  const grafikData = {
    Harian: [
      { name: "Sen", pengeluaran: 20000, persentase: 5 },
      { name: "Sel", pengeluaran: 25000, persentase: 7 },
      { name: "Rab", pengeluaran: 30000, persentase: 9 },
      { name: "Kam", pengeluaran: 35000, persentase: 10 },
      { name: "Jum", pengeluaran: 28000, persentase: 8 },
      { name: "Sab", pengeluaran: 40000, persentase: 12 },
      { name: "Min", pengeluaran: 20000, persentase: 4 },
    ],
    Mingguan: [
      { name: "Minggu 1", pengeluaran: 100000, persentase: 10 },
      { name: "Minggu 2", pengeluaran: 120000, persentase: 13 },
      { name: "Minggu 3", pengeluaran: 150000, persentase: 15 },
      { name: "Minggu 4", pengeluaran: 130000, persentase: 14 },
    ],
    Bulanan: [
      { name: "Jan", pengeluaran: 300000, persentase: 10 },
      { name: "Feb", pengeluaran: 450000, persentase: 12 },
      { name: "Mar", pengeluaran: 600000, persentase: 15 },
      { name: "Apr", pengeluaran: 550000, persentase: 14 },
      { name: "Mei", pengeluaran: 750000, persentase: 20 },
      { name: "Jun", pengeluaran: 800000, persentase: 22 },
    ],
  };

  const grafikPettyCash = grafikData[periode];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow p-6 sticky top-0 z-40">
          <h1 className="text-2xl font-semibold text-emerald-700">Dashboard</h1>
        </header>

        <section className="p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 text-left">
            Ringkasan Kas
          </h2>

          {/* Ringkasan Kartu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {dataRingkasan.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow p-6 text-center hover:shadow-md transition"
              >
                <p className="text-gray-600 mb-2 font-medium">{item.label}</p>
                <h3 className="text-2xl font-bold text-emerald-700">
                  {item.value}
                </h3>
              </div>
            ))}
          </div>

          {/* 🔹 Grafik Petty Cash */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap">
              <h3 className="font-semibold text-xl text-gray-700 text-center">
                Grafik Petty Cash
              </h3>

              {/* Pilihan Periode */}
              <div className="flex gap-6">
                {["Harian", "Mingguan", "Bulanan"].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer text-gray-700"
                  >
                    <input
                      type="radio"
                      name="periode"
                      value={item}
                      checked={periode === item}
                      onChange={() => setPeriode(item as any)}
                      className="accent-emerald-600 w-5 h-5"
                    />
                    <span className="text-base">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={grafikPettyCash}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="pengeluaran"
                    fill="#10b981"
                    barSize={40}
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="persentase"
                    stroke="#facc15"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
