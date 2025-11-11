import { NextRequest, NextResponse } from "next/server";

// Mock database, bisa diganti query ke MySQL
const users = [
  { username: "admin123", password: "12345", role: "Owner" },
  { username: "kasir123", password: "12345", role: "Kasir" },
];

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return NextResponse.json({ success: false, message: "Username atau password salah!" }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
}
