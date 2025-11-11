import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database tersambung!");
    conn.release();
  } catch (err) {
    console.error("❌ Database tidak tersambung:", err.message);
  }
  console.log(`Server berjalan di http://localhost:${port}`);
});
