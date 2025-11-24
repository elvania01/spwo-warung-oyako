"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "kasir") {
      router.replace("/login");
      return;
    }
    setVerified(true);
  }, [router]);

  if (!verified) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-600">Memeriksa akses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* KASIR NAVBAR / SIDEBAR */}
      {children}
    </div>
  );
}
