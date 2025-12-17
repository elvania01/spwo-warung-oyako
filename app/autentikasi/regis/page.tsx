"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import oyakoCat from "../../../public/oyako-cat.png";

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelp: "",
    alamat: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userSPWO", JSON.stringify(formData));
    alert("Akun berhasil dibuat!");
    router.push("/autentikasi/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/warung oyako.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/50"></div>
      </div>

      {/* Kotak putih besar */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl flex w-[900px] overflow-hidden">
        
        {/* Kiri */}
        <div className="w-1/2 flex flex-col justify-center items-center p-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-4 text-center">
            Warung Oyako
          </h1>

          <Image
            src={oyakoCat}
            alt="Warung Oyako"
            width={350}
            height={350}
            priority
            className="rounded-xl"
          />
        </div>

        {/* Kanan */}
        <div className="w-1/2 flex flex-col justify-center items-center p-10">
          <h2 className="text-3xl font-bold text-emerald-800 mb-2 text-center">
            SPWO
          </h2>
          <p className="text-gray-500 mb-6 text-center">
            Buat Akun Baru
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full max-w-xs"
          >
            <input
              type="text"
              name="namaLengkap"
              placeholder="Nama Lengkap"
              value={formData.namaLengkap}
              onChange={handleChange}
              className="border rounded-md px-4 py-2"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded-md px-4 py-2"
              required
            />

            <input
              type="text"
              name="noTelp"
              placeholder="No. Telp"
              value={formData.noTelp}
              onChange={handleChange}
              className="border rounded-md px-4 py-2"
              required
            />

            <input
              type="text"
              name="alamat"
              placeholder="Alamat"
              value={formData.alamat}
              onChange={handleChange}
              className="border rounded-md px-4 py-2"
              required
            />

            <button
              type="submit"
              className="bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700"
            >
              Buat Akun
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm mr-2">
              Sudah punya akun?
            </span>
            <button
              type="button"
              onClick={() => router.push("/autentikasi/login")}
              className="font-semibold hover:underline text-sm"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}