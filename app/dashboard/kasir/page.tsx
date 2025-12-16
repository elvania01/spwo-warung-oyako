"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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

interface Ringkasan {
  label: string;
  value: string;
}

interface GrafikItem {
  name: string;
  pengeluaran: number;
  persentase: number;
}

export default function DashboardKasirPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [periode, setPeriode] = useState<"Harian" | "Mingguan" | "Bulanan">("Harian");
  const [ringkasan, setRingkasan] = useState<Ringkasan[]>([]);
  const [grafikData, setGrafikData] = useState<GrafikItem[]>([]);

  useEffect(() => {
    // 🔒 Cek login
    if (typeof window === "undefined") return;
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/autentikasi/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => {
    if (isChecking) return;

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`/api/dashboard/kasir?periode=${periode}`);
        if (!res.ok) throw new Error("Gagal ambil data dashboard");

        const data = await res.json();
        setRingkasan(data.ringkasan);
        setGrafikData(data.grafik);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data dashboard");
      }
    };

    fetchDashboardData();
  }, [periode, isChecking]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Memeriksa sesi login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-700">Dashboard Kasir</h1>
        <p className="text-gray-500 text-sm">Periode: {periode}</p>
      </header>

      {/* Konten */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Ringkasan Aktivitas */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Ringkasan Aktivitas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ringkasan.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow p-6 text-center border-t-4 border-emerald-500 hover:shadow-lg transition"
                >
                  <p className="text-gray-600 mb-2 font-medium">{item.label}</p>
                  <h3 className="text-2xl font-bold text-emerald-700">{item.value}</h3>
                </div>
              ))}
            </div>
          </section>

          {/* Grafik */}
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="font-semibold text-xl text-gray-800">Grafik Aktivitas Kasir</h3>
              <div className="flex gap-6">
                {(["Harian", "Mingguan", "Bulanan"] as const).map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 cursor-pointer ${
                      periode === opt ? "text-emerald-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="periode"
                      value={opt}
                      checked={periode === opt}
                      onChange={() => setPeriode(opt)}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="w-full h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafikData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(value)
                    }
                  />
                  <Bar dataKey="pengeluaran" fill="#10b981" barSize={40} radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey="persentase" stroke="#15fa61ff" strokeWidth={3} dot={{ r: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
