import { NextRequest, NextResponse } from "next/server";
import sql from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { page, limit } = Object.fromEntries(req.nextUrl.searchParams.entries()) as {
      page?: string;
      limit?: string;
    };

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const inventory = await sql`SELECT * FROM inventory ORDER BY nama ASC LIMIT ${limitNum} OFFSET ${offset}`;
    const countResult = await sql`SELECT COUNT(*) AS total FROM inventory`;
    const totalItems = Number(countResult[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

    return NextResponse.json({
      success: true,
      data: inventory,
      pagination: { page: pageNum, limit: limitNum, totalItems, totalPages },
    });
  } catch (error) {
    console.error("Inventory API error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
