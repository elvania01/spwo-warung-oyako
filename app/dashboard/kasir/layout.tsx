"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SPWONavbar from "@/components/SPWOsidebar";

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/autentikasi/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role === "Kasir") {
      setIsAuthorized(true);
    } else {
      router.replace("/dashboard");
    }
  }, [router]);

  if (!isAuthorized) return null;

  return (
    <div className="flex w-screen h-screen bg-gray-100 overflow-hidden">
      {/* ✅ Sidebar */}
      <SPWONavbar onLogout={() => router.replace("/autentikasi/login")} />

      {/* ✅ Konten utama */}
      <main
        className="flex-1 ml-64 p-8 bg-gray-50 overflow-y-auto custom-scrollbar"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db transparent",
        }}
      >
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>

      {/* ✅ Style untuk menyelaraskan scrollbar */}
      <style jsx global>{`
        /* Untuk browser berbasis WebKit (Chrome, Edge, Safari) */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
