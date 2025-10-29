import mysql from "mysql2/promise";
import "dotenv/config";

let pool;

export async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      connectionLimit: 5,
      namedPlaceholders: true,
    });
    console.log("✅ MySQL pool initialisé");
  }
  return pool;
}
