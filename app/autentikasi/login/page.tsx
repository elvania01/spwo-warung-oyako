'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import oyakoCat from '../../../public/oyako-cat.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Login untuk ADMIN
    if (username === 'admin123' && password === '12345') {
      const userData = {
        username: 'admin123',
        role: 'Owner',
      };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');
      return;
    }

    // Login untuk KASIR
    if (username === 'kasir123' && password === '12345') {
      const userData = {
        username: 'kasir123',
        role: 'Kasir',
      };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard/kasir');
      return;
    }

    // Jika gagal
    setError('Username atau password salah!');
    alert('Username atau password salah!');
  };

  return (
    <div className="login-container">
      {/* Bagian Kiri */}
      <div className="login-left">
        <h1>Warung Oyako</h1>
        <Image src={oyakoCat} alt="Warung Oyako" width={500} height={500} priority />
      </div>

      {/* Bagian Kanan */}
      <div className="login-box">
        <h2>SPWO</h2>
        <p>Masuk ke Dashboard</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Log In</button>
        </form>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <div className="login-links">
          <a href="/autentikasi/forgot" className="forgot">
            Lupa kata sandi?
          </a>
        </div>

        <div className="signup">
          <span className="new-user">Pengguna baru?</span>
          <a href="/autentikasi/regis" className="signup-link">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
