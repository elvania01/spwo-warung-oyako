"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface SPWONavbarProps {
  onLogout: () => void;
  activePage?: string;
}

export default function SPWONavbar({ onLogout, activePage }: SPWONavbarProps) {
  const pathname = usePathname();

  // Ambil segmen setelah /dashboard/
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentPage =
    pathSegments[1] && pathSegments[0] === "dashboard"
      ? pathSegments[1]
      : "dashboard";

  const menu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Laporan", href: "/dashboard/laporan" },
    { label: "Petty Cash", href: "/dashboard/pettycash" },
    { label: "Inventory", href: "/dashboard/inventory" },
  ];

  return (
    <motion.aside
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-0 left-0 h-full w-64 bg-emerald-500 text-white flex flex-col justify-between shadow-xl"
    >
      <div>
        {/* Header */}
        <div className="p-6 text-center border-b border-emerald-400">
          <h1 className="text-3xl font-bold">SPWO</h1>
        </div>

        {/* User info */}
        <div className="text-center py-6 border-b border-emerald-400">
          <div className="w-14 h-14 mx-auto bg-yellow-200 text-gray-700 rounded-full flex items-center justify-center text-2xl font-semibold">
            O
          </div>
          <p className="mt-2 font-semibold text-sm">Owner</p>
        </div>

        {/* Menu navigasi */}
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
                      ? "bg-emerald-700 font-semibold"
                      : "hover:bg-emerald-400"
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Tombol logout */}
      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-2 py-4 hover:bg-emerald-700 transition text-sm font-medium"
      >
        Logout
      </button>
    </motion.aside>
  );
}
