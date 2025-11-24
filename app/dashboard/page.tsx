"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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

interface RingkasanType {
  totalPengeluaran: number;
  sisaSaldo: number;
  transaksiBulan: number;
  pending: number;
}

interface GrafikType {
  harian: Array<{ name: string; pengeluaran: number; persentase: number }>;
  mingguan: Array<{ name: string; pengeluaran: number; persentase: number }>;
  bulanan: Array<{ name: string; pengeluaran: number; persentase: number }>;
}

export default function DashboardPage() {
  const router = useRouter();

  // mounted -> pastikan cek localStorage hanya di client setelah mount
  const [mounted, setMounted] = useState(false);

  // loading untuk data (tetap render halaman walau loading)
  const [loadingData, setLoadingData] = useState(true);

  // states data
  const [ringkasan, setRingkasan] = useState<RingkasanType | null>(null);
  const [grafik, setGrafik] = useState<GrafikType | null>(null);

  const [periode, setPeriode] = useState<"Harian" | "Mingguan" | "Bulanan">(
    "Harian"
  );

  // abort ref untuk fetch
  const abortRef = useRef<AbortController | null>(null);

  // -------------------------
  // 1) mount + auth check (only on client)
  // -------------------------
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // cek user di localStorage (hanya baca, jangan mutate)
    const stored = localStorage.getItem("user");
    if (!stored) {
      // arahkan ke autentikasi jika memang tidak login
      // gunakan replace agar tidak menambah history
      router.replace("/autentikasi/login");
      return;
    }

    // kalau ada user, kita lanjut ambil data
    loadDashboardData();

    // cleanup: abort fetch jika component unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); // hanya depend pada mounted

  // -------------------------
  // 2) fungsi load data
  // -------------------------
  async function loadDashboardData() {
    setLoadingData(true);

    // abort controller untuk safety
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/dashboard", { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();

      // tunggu validasi shape sedikit — fallback aman
      const safeRingkasan: RingkasanType = {
        totalPengeluaran:
          (data?.ringkasan?.totalPengeluaran ?? 0) as number,
        sisaSaldo: (data?.ringkasan?.sisaSaldo ?? 0) as number,
        transaksiBulan: (data?.ringkasan?.transaksiBulan ?? 0) as number,
        pending: (data?.ringkasan?.pending ?? 0) as number,
      };

      const safeGrafik: GrafikType = {
        harian: Array.isArray(data?.grafik?.harian) ? data.grafik.harian : [],
        mingguan: Array.isArray(data?.grafik?.mingguan)
          ? data.grafik.mingguan
          : [],
        bulanan: Array.isArray(data?.grafik?.bulanan)
          ? data.grafik.bulanan
          : [],
      };

      setRingkasan(safeRingkasan);
      setGrafik(safeGrafik);
    } catch (err: any) {
      if (err.name === "AbortError") {
        // ignore abort
      } else {
        console.error("Gagal mengambil data dashboard:", err);
        // tetap set default agar halaman muncul
        setRingkasan({
          totalPengeluaran: 0,
          sisaSaldo: 0,
          transaksiBulan: 0,
          pending: 0,
        });
        setGrafik({
          harian: [],
          mingguan: [],
          bulanan: [],
        });
      }
    } finally {
      setLoadingData(false);
      abortRef.current = null;
    }
  }

  // -------------------------
  // 3) UI helpers
  // -------------------------
  const defaultRingkasan: RingkasanType = {
    totalPengeluaran: 0,
    sisaSaldo: 0,
    transaksiBulan: 0,
    pending: 0,
  };

  const dataRingkasan = ringkasan ?? defaultRingkasan;

  const grafikPettyCash =
    periode === "Harian"
      ? grafik?.harian ?? []
      : periode === "Mingguan"
      ? grafik?.mingguan ?? []
      : grafik?.bulanan ?? [];

  // Format rupiah aman
  const formatRupiah = (v: number) =>
    typeof v === "number" ? v.toLocaleString("id-ID") : "0";

  // -------------------------
  // 4) render
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow p-6 sticky top-0 z-40">
          <h1 className="text-2xl font-semibold text-emerald-700">Dashboard</h1>
        </header>

        <section className="p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 text-left">
            Ringkasan Kas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 mb-2 font-medium">Total Pengeluaran</p>
              <h3 className="text-2xl font-bold text-emerald-700">
                {loadingData ? (
                  <span className="inline-block w-32 h-6 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>Rp {formatRupiah(dataRingkasan.totalPengeluaran)}</>
                )}
              </h3>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 mb-2 font-medium">Sisa Saldo</p>
              <h3 className="text-2xl font-bold text-emerald-700">
                {loadingData ? (
                  <span className="inline-block w-28 h-6 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>Rp {formatRupiah(dataRingkasan.sisaSaldo)}</>
                )}
              </h3>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 mb-2 font-medium">
                Transaksi Bulan Ini
              </p>
              <h3 className="text-2xl font-bold text-emerald-700">
                {loadingData ? (
                  <span className="inline-block w-12 h-6 bg-gray-200 rounded animate-pulse" />
                ) : (
                  dataRingkasan.transaksiBulan
                )}
              </h3>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 mb-2 font-medium">Pending</p>
              <h3 className="text-2xl font-bold text-emerald-700">
                {loadingData ? (
                  <span className="inline-block w-12 h-6 bg-gray-200 rounded animate-pulse" />
                ) : (
                  dataRingkasan.pending
                )}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap">
              <h3 className="font-semibold text-xl text-gray-700 text-center">
                Grafik Petty Cash
              </h3>

              <div className="flex gap-6">
                {(["Harian", "Mingguan", "Bulanan"] as const).map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer text-gray-700"
                  >
                    <input
                      type="radio"
                      name="periode"
                      value={item}
                      checked={periode === item}
                      onChange={() => setPeriode(item)}
                      className="accent-emerald-600 w-5 h-5"
                    />
                    <span className="text-base">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="w-full h-96">
              {/* Jika loadingData, tampilkan skeleton chart (kotak abu) */}
              {loadingData ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              ) : (
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
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
