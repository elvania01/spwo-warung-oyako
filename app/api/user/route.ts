import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await sql`SELECT id, username, role FROM users`;
    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const rows = await sql`
      INSERT INTO users (username, password, role)
      VALUES (${username}, ${hashed}, ${role})
      RETURNING id
    `;

    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
