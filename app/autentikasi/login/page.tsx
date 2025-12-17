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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
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
            Masuk ke Dashboard
          </p>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4 w-full max-w-xs"
          >
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
              className="bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700"
            >
              Log In
            </button>
          </form>

          {error && (
            <p className="text-red-600 text-sm mt-2 text-center">
              {error}
            </p>
          )}


          <div className="mt-3 text-center">
            <span className="text-gray-600 text-sm mr-2">
              Pengguna baru?
            </span>
            <a
              href="/autentikasi/regis"
              className="font-semibold hover:underline text-sm"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}