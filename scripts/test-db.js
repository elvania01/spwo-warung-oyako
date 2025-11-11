import pool from "./lib/db.js";

async function testConnection() {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS result");
    console.log("Database tersambung ✅", rows);
  } catch (err) {
    console.error("Database tidak tersambung ❌", err.message);
  }
}

testConnection();
