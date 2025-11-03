import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SPWO Login",
  description: "Halaman login SPWO Petty Cash",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

