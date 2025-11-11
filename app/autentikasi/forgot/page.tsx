'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IoEyeOff, IoEye } from 'react-icons/io5';

export default function LoginSPWO() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      alert('Harap isi username dan password!');
      return;
    }

    setLoading(true);
    try {
      // Contoh proses login (mock)
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        alert('Login berhasil!');
        // Arahkan ke dashboard SPWO
        window.location.href = '/dashboard';
      } else {
        alert('Username atau password salah.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-yellow-100 to-orange-200">
      {/* Bagian kiri */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-orange-700 mb-4 font-poppins">
          Warung Oyako
        </h1>
        <Image
          src="/oyako-cat.png"
          alt="Warung Oyako"
          width={250}
          height={250}
          className="rounded-lg"
        />
      </div>

      {/* Bagian kanan */}
      <div className="flex-1 flex flex-col justify-center bg-white shadow-xl rounded-t-3xl md:rounded-none md:rounded-l-3xl p-8 md:p-12">
        <h2 className="text-3xl font-semibold text-center text-orange-700 mb-2">
          SPWO
        </h2>
        <p className="text-center text-gray-500 mb-6">Masuk ke Dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
            >
              {showPassword ? <IoEyeOff size={22} /> : <IoEye size={22} />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-md text-white font-semibold transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <a
            href="/reset-password"
            className="text-sm text-orange-600 hover:underline"
          >
            Lupa kata sandi?
          </a>
        </div>

        <div className="text-center mt-4 text-sm">
          <span className="text-gray-600">Pengguna baru? </span>
          <a href="/register" className="text-orange-600 hover:underline">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
