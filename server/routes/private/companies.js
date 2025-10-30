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
      return res.status(409).json({ error: "Entreprise déjà existante" });
    res.status(500).json({ error: e.message });
  }
});

/**
 * PUT /api/private/companies/:id
 * Mettre à jour une entreprise
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params || {};
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "name requis" });
  try {
    const pool = await getPool();
    const [r] = await pool.execute(
      "UPDATE companies SET name = ? WHERE id = ?",
      [name.trim(), id]
    );
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "Entreprise non trouvée" });
    res.json({ id: Number(id), name: name.trim() });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Entreprise déjà existante" });
    res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/private/companies/:id
 * Supprimer une entreprise
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params || {};
  try {
    const pool = await getPool();
    const [r] = await pool.execute("DELETE FROM companies WHERE id = ?", [id]);
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "Entreprise non trouvée" });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
