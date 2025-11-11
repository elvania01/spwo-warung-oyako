import { NextRequest, NextResponse } from "next/server";

let laporanData = [
  { id: "LAP01", tanggal: "2025-10-01", nama: "Es Batu", idTransaksi: "NAH47E", jumlah: 1, harga: 20000 },
  { id: "LAP02", tanggal: "2025-10-01", nama: "Gula", idTransaksi: "NAH47E", jumlah: 2, harga: 20000 },
];

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") || "kasir";
  return NextResponse.json({ data: laporanData });
}

export async function POST(req: NextRequest) {
  const { id, tanggal, nama, idTransaksi, jumlah, harga } = await req.json();
  laporanData.push({ id, tanggal, nama, idTransaksi, jumlah, harga });
  return NextResponse.json({ message: "Berhasil tambah laporan", data: laporanData });
}

export async function PUT(req: NextRequest) {
  const { id, jumlah, harga } = await req.json();
  const idx = laporanData.findIndex((l) => l.id === id);
  if (idx >= 0) {
    laporanData[idx] = { ...laporanData[idx], jumlah, harga };
    return NextResponse.json({ message: "Berhasil update laporan" });
  }
  return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  laporanData = laporanData.filter((l) => l.id !== id);
  return NextResponse.json({ message: "Berhasil hapus laporan" });
}
