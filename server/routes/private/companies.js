import { Router } from "express";
import { getPool } from "../../services/db.js";

const router = Router();

/**
 * GET /api/private/companies
 * Liste des entreprises
 */
router.get("/", async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id, name FROM companies ORDER BY name ASC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/private/companies
 * Créer une entreprise
 */
router.post("/", async (req, res) => {
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "name requis" });
  try {
    const pool = await getPool();
    const [r] = await pool.execute("INSERT INTO companies (name) VALUES (?)", [
      name.trim(),
    ]);
    res.status(201).json({ id: r.insertId, name: name.trim() });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "name déjà utilisé" });
    res.status(500).json({ error: e.message });
  }
});

export default router;
