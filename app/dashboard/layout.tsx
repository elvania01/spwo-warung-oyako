"use client";

import SPWONavbar from "@/components/SPWOsidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/autentikasi/login";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SPWONavbar onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full overflow-y-auto pr-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}