import { Router } from "express";
import { getPool } from "../../services/db.js";
const router = Router();

/**
 * GET /api/private/tags
 * Liste des tags
 */
router.get("/", async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id, label FROM tags ORDER BY label ASC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/private/tags
 * Création d'un tag
 */
router.post("/", async (req, res) => {
  const { label } = req.body || {};
  if (!label?.trim()) return res.status(400).json({ error: "label requis" });
  try {
    const pool = await getPool();
    const [r] = await pool.execute("INSERT INTO tags (label) VALUES (?)", [
      label.trim(),
    ]);
    res.status(201).json({ id: r.insertId, label: label.trim() });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Tag déjà existant" });
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/tags/:id/models
 * Récupère les modèles de meubles associés à un tag
 */
router.get("/:id/models", async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT m.id, m.name, c.name AS category
       FROM furniture_models m
       JOIN furniture_tags ft ON ft.furniture_model_id = m.id
       JOIN categories c ON c.id = m.category_id
       WHERE ft.tag_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
