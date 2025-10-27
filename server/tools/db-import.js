import "dotenv/config";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run(file) {
  const sql = fs.readFileSync(
    path.join(__dirname, "..", "database", file),
    "utf8"
  );
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  try {
    await conn.query(sql);
    console.log(`OK: ${file}`);
  } finally {
    await conn.end();
  }
}

const file = process.argv[2];
if (!file) {
  console.error("Utilisation: node db-import.js <filename.sql>");
  process.exit(1);
}
run(file).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
