import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SPWO Dashboard",
  description: "Sistem Pengelolaan Warung Owner - Petty Cash & Inventory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
