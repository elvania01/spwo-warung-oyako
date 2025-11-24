'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import oyakoCat from '../../../public/oyako-cat.png';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // ✅ Pastikan hanya render di client (hindari SSR hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Jangan render sebelum client mount
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'admin123' && password === '12345') {
      const userData = { username: 'admin123', role: 'Owner' };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');
      return;
    }

    if (username === 'kasir123' && password === '12345') {
      const userData = { username: 'kasir123', role: 'Kasir' };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');
      return;
    }

    setError('Username atau password salah!');
    alert('Username atau password salah!');
  };

  return (
    <div className="login-container flex h-screen">
      {/* Kiri */}
      <div className="login-left flex-1 flex flex-col justify-center items-center bg-amber-100 p-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-4">Warung Oyako</h1>
        <Image
          src={oyakoCat}
          alt="Warung Oyako"
          width={400}
          height={400}
          priority
          className="rounded-xl"
        />
      </div>

      {/* Kanan */}
      <div className="login-box flex-1 flex flex-col justify-center items-center bg-white shadow-lg p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">SPWO</h2>
        <p className="text-gray-500 mb-6">Masuk ke Dashboard</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-72">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border rounded-md px-4 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-md px-4 py-2"
          />
          <button
            type="submit"
            className="bg-amber-600 text-white font-semibold py-2 rounded-md hover:bg-amber-700"
          >
            Log In
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <div className="login-links mt-4">
          <a href="/autentikasi/forgot" className="text-amber-700 hover:underline">
            Lupa kata sandi?
          </a>
        </div>

        <div className="signup mt-3">
          <span className="text-gray-600 mr-2">Pengguna baru?</span>
          <a href="/autentikasi/regis" className="text-amber-700 font-semibold hover:underline">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
