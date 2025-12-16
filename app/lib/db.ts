// lib/db.ts - PASTIKAN CONFIGURASI BENAR
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Test function
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as time, version() as version`;
    console.log("🕒 Database time:", result[0].time);
    console.log("🐘 PostgreSQL version:", result[0].version);
    return result;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export { sql };
