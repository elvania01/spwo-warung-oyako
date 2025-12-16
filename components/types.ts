// types.ts
export interface DashboardStatsProps {
  className?: string;
}

export interface PettyCashData {
  id: number;
  id_transaksi: string;
  nama_produk: string;
  kategori: string;
  jumlah: number;
  harga: number;
  total: number;
  tanggal: string;
  created_at: string;
}

export interface StatsData {
  totalTransaksi: number;
  totalNilai: number;
  rataRata: number;
  kategoriTerbanyak: string;
}