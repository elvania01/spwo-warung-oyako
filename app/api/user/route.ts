import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db"; // <- wajib ada
import { ResultSetHeader } from "mysql2";

export async function GET(req: NextRequest) {
  try {
    const users = await query("SELECT * FROM users");
    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = (await query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [body.username, body.password, body.role]
    )) as ResultSetHeader;

    return NextResponse.json({ id: result.insertId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
