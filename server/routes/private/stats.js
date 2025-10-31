import { Router } from "express";
import { getPool } from "../../services/db.js";

const router = Router();

/**
 * GET /api/private/stats/global
 * Stats globales (compteurs simples)
 */
router.get("/global", async (_req, res) => {
  try {
    const pool = await getPool();
    const [[counts]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM furniture_models) AS models,
        (SELECT COUNT(*) FROM builds) AS builds,
        (SELECT COUNT(*) FROM materials) AS materials,
        (SELECT COUNT(*) FROM categories) AS categories
    `);
    res.json(counts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/stats/materials/top
 * Top matières utilisées
 */
router.get("/materials/top", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 7); // 7 matières dans l’énoncé
    const pool = await getPool();
    const [rows] = await pool.query(
      `
      SELECT mat.name, mat.type, SUM(bm.quantity) AS total_qty
      FROM build_materials bm
      JOIN materials mat ON mat.id = bm.material_id
      GROUP BY mat.id
      ORDER BY total_qty DESC
      LIMIT ?
    `,
      [limit]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/stats/companies
 * Répartition des matériaux par entreprise (fournisseur)
 */
router.get("/companies", async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT comp.name AS company, SUM(bm.quantity) AS total_qty
      FROM build_materials bm
      JOIN materials mat ON mat.id = bm.material_id
      JOIN companies comp ON comp.id = mat.company_id
      GROUP BY comp.id
      ORDER BY total_qty DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/stats/categories
 * Nombre de meubles réalisés par catégorie
 */
router.get("/categories", async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT c.name AS category, COUNT(b.id) AS build_count
      FROM categories c
      LEFT JOIN furniture_models m ON m.category_id = c.id
      LEFT JOIN builds b ON b.model_id = m.id
      GROUP BY c.id
      ORDER BY build_count DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
