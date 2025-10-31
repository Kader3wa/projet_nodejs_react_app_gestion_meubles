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
 * PUT /api/private/tags/:id
 * Modification d'un tag
 */
router.put("/:id", async (req, res) => {
  const { label } = req.body || {};
  if (!label?.trim()) return res.status(400).json({ error: "label requis" });
  try {
    const pool = await getPool();
    await pool.execute("UPDATE tags SET label=? WHERE id=?", [
      label.trim(),
      req.params.id,
    ]);
    res.json({ id: Number(req.params.id), label: label.trim() });
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

/**
 * GET /api/private/tags/:id/materials
 * Récupère les matériaux associés à un tag
 */
router.get("/:id/materials", async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT m.id, m.name, m.type
       FROM materials m
       JOIN tag_materials tm ON tm.material_id = m.id
       WHERE tm.tag_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * PUT /api/private/tags/:id/models
 * Associer des modèles de meubles à un tag
 */
router.put("/:id/materials", async (req, res) => {
  const { material_ids } = req.body || {};
  if (!Array.isArray(material_ids))
    return res.status(400).json({ error: "material_ids[] requis" });
  const pool = await getPool();
  await pool.execute("DELETE FROM tag_materials WHERE tag_id=?", [
    req.params.id,
  ]);
  if (material_ids.length) {
    const values = material_ids.map((mid) => [req.params.id, mid]);
    await pool.query(
      "INSERT INTO tag_materials (tag_id, material_id) VALUES ?",
      [values]
    );
  }
  res.json({ ok: true });
});

/**
 * DELETE /api/private/tags/:id
 * Supprimer un tag
 */
router.delete("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    await pool.execute("DELETE FROM tags WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
