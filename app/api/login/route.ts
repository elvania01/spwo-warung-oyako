import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const users = await sql`SELECT * FROM users WHERE username = ${username}`;

    if (users.length === 0) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
