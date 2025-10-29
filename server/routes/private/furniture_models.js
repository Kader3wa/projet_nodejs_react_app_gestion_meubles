import { Router } from "express";
import { getPool } from "../../services/db.js";

const router = Router();

/**
 * GET /api/private/furniture_models
 * Liste + catégorie + nb de réalisations
 */
router.get("/", async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT m.id, m.name, m.description,
              c.id AS category_id, c.name AS category_name,
              COUNT(b.id) AS builds_count
       FROM furniture_models m
       JOIN categories c ON c.id = m.category_id
       LEFT JOIN builds b ON b.furniture_model_id = m.id
       GROUP BY m.id
       ORDER BY m.name ASC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/furniture_models/:id
 * Détail + catégorie
 */
router.get("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const [[row]] = await pool.query(
      `SELECT m.id, m.name, m.description,
              c.id AS category_id, c.name AS category_name
       FROM furniture_models m
       JOIN categories c ON c.id = m.category_id
       WHERE m.id = ?`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/private/furniture_models
 * body: { name, description?, category_id }
 */
router.post("/", async (req, res) => {
  const { name, description = null, category_id } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "name requis" });
  if (!Number.isInteger(Number(category_id)))
    return res.status(400).json({ error: "category_id invalide" });

  try {
    const pool = await getPool();

    // vérif catégorie
    const [[cat]] = await pool.query("SELECT id FROM categories WHERE id = ?", [
      category_id,
    ]);
    if (!cat) return res.status(400).json({ error: "category_id inconnu" });

    const [r] = await pool.execute(
      "INSERT INTO furniture_models (name, description, category_id) VALUES (?, ?, ?)",
      [name.trim(), description, category_id]
    );
    res.status(201).json({
      id: r.insertId,
      name: name.trim(),
      description,
      category_id,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * PUT /api/private/furniture_models/:id
 * body: { name?, description?, category_id? }
 */
router.put("/:id", async (req, res) => {
  const { name, description, category_id } = req.body || {};
  if (name !== undefined && !name?.trim())
    return res.status(400).json({ error: "name invalide" });
  if (category_id !== undefined && !Number.isInteger(Number(category_id)))
    return res.status(400).json({ error: "category_id invalide" });

  try {
    const pool = await getPool();

    // existe ?
    const [[exists]] = await pool.query(
      "SELECT id FROM furniture_models WHERE id = ?",
      [req.params.id]
    );
    if (!exists) return res.status(404).json({ error: "not_found" });

    // vérif catégorie si fournie
    if (category_id !== undefined) {
      const [[cat]] = await pool.query(
        "SELECT id FROM categories WHERE id = ?",
        [category_id]
      );
      if (!cat) return res.status(400).json({ error: "category_id inconnu" });
    }

    // build update dynamique
    const fields = [];
    const params = [];
    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name.trim());
    }
    if (description !== undefined) {
      fields.push("description = ?");
      params.push(description ?? null);
    }
    if (category_id !== undefined) {
      fields.push("category_id = ?");
      params.push(category_id);
    }

    if (fields.length) {
      params.push(req.params.id);
      await pool.execute(
        `UPDATE furniture_models SET ${fields.join(", ")} WHERE id = ?`,
        params
      );
    }

    res.json({ id: Number(req.params.id) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/private/furniture_models/:id
 * Cascade sur builds et furniture_tags via FK
 */
router.delete("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const [r] = await pool.execute(
      "DELETE FROM furniture_models WHERE id = ?",
      [req.params.id]
    );
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "not_found" });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
