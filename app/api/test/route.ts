import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET() {
  try {
    const res = await sql`SELECT NOW()`;
    console.log("Neon OK:", res);
    return NextResponse.json({ success: true, result: res });
  } catch (err) {
    console.error("Neon error:", err);
    return NextResponse.json({ success: false, message: (err as Error).message });
  }
}
