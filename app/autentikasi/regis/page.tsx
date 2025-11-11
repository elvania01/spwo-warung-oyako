"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelp: "",
    alamat: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simpan data ke localStorage sebagai simulasi
    localStorage.setItem("userSPWO", JSON.stringify(formData));
    alert("Akun berhasil dibuat!");
    router.push("/autentikasi/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white font-poppins">
      {/* BAGIAN KIRI */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#5DA46D] mb-4">
          Warung Oyako
        </h1>
        <Image
          src="/oyako-cat.png"
          alt="Warung Oyako"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* BAGIAN KANAN (FORM) */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#6FC693] p-8 md:p-10 rounded-3xl md:rounded-none md:rounded-l-3xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#1B1B1B] mb-2">SPWO</h2>
        <p className="text-md text-[#1B1B1B] font-medium mb-6">
          Masuk ke Dashboard
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 w-full"
        >
          <input
            type="text"
            name="namaLengkap"
            placeholder="Nama Lengkap"
            value={formData.namaLengkap}
            onChange={handleChange}
            className="w-full p-3 border border-black rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-black rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="text"
            name="noTelp"
            placeholder="No. Telp"
            value={formData.noTelp}
            onChange={handleChange}
            className="w-full p-3 border border-black rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="text"
            name="alamat"
            placeholder="Alamat"
            value={formData.alamat}
            onChange={handleChange}
            className="w-full p-3 border border-black rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#2563EB] text-white font-semibold py-3 rounded-full hover:bg-[#1E4ED8] transition-all duration-200"
          >
            Buat Akun
          </button>
        </form>

        <p className="mt-4 text-sm text-black">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => router.push("/autentikasi/login")}
            className="text-red-600 hover:underline font-semibold"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
