// DashboardStats.tsx
import React from 'react';

// Jika tidak menggunakan file types, definisikan langsung di sini
interface DashboardStatsProps {
  className?: string;
  totalTransaksi?: number;
  totalNilai?: number;
  rataRata?: number;
  kategoriTerbanyak?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  className = '',
  totalTransaksi = 0,
  totalNilai = 0,
  rataRata = 0,
  kategoriTerbanyak = '-'
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Card Total Transaksi */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Transaksi</h3>
            <p className="text-2xl font-bold text-gray-900">{totalTransaksi.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Card Total Nilai */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Nilai</h3>
            <p className="text-2xl font-bold text-gray-900">
              Rp {totalNilai.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Card Rata-rata */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 00-1.6 0l-6 8A1 1 0 004 22h16a1 1 0 00.8-1.6l-6-8z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v-1" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Rata-rata per Transaksi</h3>
            <p className="text-2xl font-bold text-gray-900">
              Rp {Math.round(rataRata).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Card Kategori Terbanyak */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Kategori Terbanyak</h3>
            <p className="text-2xl font-bold text-gray-900">{kategoriTerbanyak}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;