import { Router } from "express";
import { getPool } from "../../services/db.js";
const router = Router();

/**
 * GET /api/private/stats/global
 * Statistiques globales
 */
router.get("/global", async (_req, res) => {
  try {
    const pool = await getPool();
    const [[counts]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM furniture_models) AS models,
        (SELECT COUNT(*) FROM builds) AS builds,
        (SELECT COUNT(*) FROM materials) AS materials
    `);
    res.json(counts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/stats/materials
 * Matériaux les plus utilisés
 */
router.get("/materials", async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT mat.name, mat.type, SUM(bm.quantity) AS total_qty
      FROM build_materials bm
      JOIN materials mat ON mat.id = bm.material_id
      GROUP BY mat.id
      ORDER BY total_qty DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/stats/categories
 * Nombre de modèles par catégorie
 */
router.get("/categories", async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT c.name AS category, COUNT(m.id) AS model_count
      FROM categories c
      LEFT JOIN furniture_models m ON m.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
