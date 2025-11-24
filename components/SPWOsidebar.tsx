"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SPWONavbarProps {
  onLogout: () => void;
  activePage?: string; 
}


export default function SPWONavbar({ onLogout }: SPWONavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setRole(userData.role);
      setUsername(userData.username);
    } else {
      router.push("/autentikasi/login");
    }
    setTimeout(() => setLoading(false), 30); // biar smooth aja
  }, [router]);

  const pathSegments = pathname.split("/").filter(Boolean);
  const currentPage =
    pathSegments[1] && pathSegments[0] === "dashboard"
      ? pathSegments[1]
      : "dashboard";

  const ownerMenu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Laporan", href: "/dashboard/laporan" },
    { label: "Petty Cash", href: "/dashboard/pettycash" },
    { label: "Inventory", href: "/dashboard/inventory" },
  ];

  const kasirMenu = [
    { label: "Dashboard", href: "/dashboard/kasir" },
    { label: "Petty Cash", href: "/dashboard/kasir/pettycash" },
    { label: "Inventory", href: "/dashboard/kasir/inventory" },
  ];

  const menu = role === "Owner" ? ownerMenu : kasirMenu;

  // ✅ Ganti blank putih jadi tampilan loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-600 text-white">
        <div className="animate-pulse text-lg font-semibold">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <motion.aside
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-0 left-0 h-full w-64 bg-emerald-600 text-white flex flex-col justify-between shadow-xl"
    >
      <div>
        <div className="p-6 text-center border-b border-emerald-500">
          <h1 className="text-3xl font-bold">SPWO</h1>
        </div>

        <div className="text-center py-6 border-b border-emerald-500">
          <div className="w-14 h-14 mx-auto bg-yellow-200 text-gray-800 rounded-full flex items-center justify-center text-2xl font-semibold">
            {username ? username.charAt(0).toUpperCase() : "?"}
          </div>
          <p className="mt-2 font-semibold text-sm">{role}</p>
        </div>

        <nav className="flex flex-col mt-4">
          {menu.map((item) => {
            const segment = item.href.split("/")[2] || "dashboard";
            const isActive = currentPage === segment;

            return (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  className={`block py-3 px-6 rounded-l-full transition-colors duration-200 ${
                    isActive
                      ? "bg-emerald-800 font-semibold"
                      : "hover:bg-emerald-500"
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("user");
          onLogout();
          router.push("/autentikasi/login");
        }}
        className="flex items-center justify-center gap-2 py-4 hover:bg-emerald-700 transition text-sm font-medium"
      >
        🚪 Logout
      </button>
    </motion.aside>
  );
}
