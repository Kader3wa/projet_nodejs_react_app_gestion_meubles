import "dotenv/config";
import mysql from "mysql2/promise";

async function createDatabase() {
  const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
  });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✅ Base '${DB_NAME}' prête`);
  } catch (err) {
    console.error("Erreur création DB:", err.message);
  } finally {
    await conn.end();
  }
}

createDatabase();
