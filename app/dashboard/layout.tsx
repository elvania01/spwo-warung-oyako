"use client";
import SPWONavbar from "@/components/SPWOsidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/autentikasi/login";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SPWONavbar onLogout={handleLogout} />
      <main className="flex-1 ml-64 overflow-y-auto">{children}</main>
    </div>
  );
}
