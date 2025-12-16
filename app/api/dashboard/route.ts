import { NextRequest, NextResponse } from 'next/server';

// Tipe data untuk response
interface GrafikDataItem {
  name: string;
  pengeluaran: number;
  persentase: number;
}

interface RingkasanResponse {
  totalPengeluaran: number;
  sisaSaldo: number;
  transaksiBulan: number;
  pending: number;
}

interface GrafikResponse {
  harian: GrafikDataItem[];
  mingguan: GrafikDataItem[];
  bulanan: GrafikDataItem[];
}

interface ApiResponse {
  ringkasan: RingkasanResponse;
  grafik: GrafikResponse;
}

// Mock data untuk development
const generateMockData = (periode: string, dari: string, sampai: string) => {
  const startDate = new Date(dari);
  const endDate = new Date(sampai);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Data harian
  const harian: GrafikDataItem[] = [];
  for (let i = 0; i < Math.min(diffDays, 30); i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    harian.push({
      name: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      pengeluaran: Math.floor(Math.random() * 5000000) + 1000000,
      persentase: Math.floor(Math.random() * 30) + 10,
    });
  }
  
  // Data mingguan (group by week)
  const mingguan: GrafikDataItem[] = [];
  const weeks = Math.ceil(diffDays / 7);
  for (let i = 0; i < Math.min(weeks, 12); i++) {
    mingguan.push({
      name: `Minggu ${i + 1}`,
      pengeluaran: Math.floor(Math.random() * 15000000) + 5000000,
      persentase: Math.floor(Math.random() * 40) + 20,
    });
  }
  
  // Data bulanan
  const bulanan: GrafikDataItem[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentMonth = new Date().getMonth();
  const monthsToShow = 6;
  
  for (let i = 0; i < monthsToShow; i++) {
    const monthIndex = (currentMonth - monthsToShow + 1 + i + 12) % 12;
    bulanan.push({
      name: months[monthIndex],
      pengeluaran: Math.floor(Math.random() * 20000000) + 10000000,
      persentase: Math.floor(Math.random() * 50) + 30,
    });
  }
  
  return { harian, mingguan, bulanan };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari') || new Date().toISOString().split('T')[0];
    const sampai = searchParams.get('sampai') || new Date().toISOString().split('T')[0];
    
    console.log('Fetching dashboard data:', { dari, sampai });
    
    // TODO: Ganti dengan koneksi database sebenarnya
    // Contoh dengan Prisma:
    // const transactions = await prisma.transaction.findMany({
    //   where: {
    //     tanggal: {
    //       gte: new Date(dari),
    //       lte: new Date(sampai),
    //     },
    //   },
    //   include: {
    //     kategori: true,
    //   },
    // });
    
    // Generate mock data berdasarkan filter
    const grafik = generateMockData('bulanan', dari, sampai);
    
    // Hitung ringkasan dari data
    const totalPengeluaran = grafik.bulanan.reduce((sum, item) => sum + item.pengeluaran, 0);
    const totalTransaksi = grafik.bulanan.reduce((sum, item) => sum + Math.floor(item.pengeluaran / 1000000), 0);
    
    const ringkasan: RingkasanResponse = {
      totalPengeluaran,
      sisaSaldo: 50000000 - totalPengeluaran, // Saldo awal 50 juta
      transaksiBulan: totalTransaksi,
      pending: Math.floor(Math.random() * 10) + 1,
    };
    
    const response: ApiResponse = {
      ringkasan,
      grafik,
    };
    
    // Simulasi delay network
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in dashboard API:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}