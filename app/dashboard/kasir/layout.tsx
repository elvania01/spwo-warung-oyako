"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "kasir" | "admin" | "supervisor" | null;

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Cek apakah ada user yang login
        const user = localStorage.getItem("user");
        if (!user) {
          router.replace("/autentikasi/login");
          return;
        }

        // Parse user data
        const userData = JSON.parse(user);
        const role = userData.role || localStorage.getItem("role") as UserRole;

        // Verifikasi role kasir
        if (role !== "kasir") {
          console.warn(`Access denied. Role: ${role}. Expected: kasir`);
          router.replace("/autentikasi/login");
          return;
        }

        setVerified(true);
      } catch (error) {
        console.error("Authentication error:", error);
        router.replace("/autentikasi/login");
      } finally {
        setLoading(false);
      }
    };

    // Delay sedikit untuk memberikan waktu render initial UI
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Memeriksa akses...</p>
        <p className="text-sm text-gray-400 mt-2">Mohon tunggu sebentar</p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8 rounded-xl bg-white shadow-sm border border-gray-200 max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Akses Ditolak</h3>
          <p className="text-gray-600 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <button
            onClick={() => router.push("/autentikasi/login")}
            className="btn-primary w-full"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background pattern subtle */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 -z-10"></div>
      
      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}