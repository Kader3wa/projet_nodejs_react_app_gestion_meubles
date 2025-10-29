import { Router } from "express";
import { getPool } from "../../services/db.js";

const router = Router();
const TYPES = new Set(["Bois", "Fer", "Plastique"]);

/**
 * GET /api/private/materials
 * Liste des matériaux avec filtres optionnels
 */
router.get("/", async (req, res) => {
  const { type, company_id } = req.query;
  const where = [];
  const params = [];

  if (type) {
    if (!TYPES.has(type))
      return res.status(400).json({ error: "type invalide" });
    where.push("m.type=?");
    params.push(type);
  }
  if (company_id) {
    where.push("m.company_id=?");
    params.push(Number(company_id));
  }

  const sql = `
    SELECT m.id, m.name, m.type, m.company_id, c.name AS company
    FROM materials m
    JOIN companies c ON c.id=m.company_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY m.name ASC
  `;
  try {
    const pool = await getPool();
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/private/materials
 * Créer un matériau
 */
router.post("/", async (req, res) => {
  const { name, type, company_id } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "name requis" });
  if (!TYPES.has(type)) return res.status(400).json({ error: "type invalide" });
  if (!company_id) return res.status(400).json({ error: "company_id requis" });

  try {
    const pool = await getPool();
    const [c] = await pool.execute("SELECT id FROM companies WHERE id=?", [
      company_id,
    ]);
    if (c.length === 0)
      return res.status(400).json({ error: "company_id inconnu" });

    const [dup] = await pool.execute(
      "SELECT id FROM materials WHERE name=? AND company_id=? LIMIT 1",
      [name.trim(), company_id]
    );
    if (dup.length)
      return res
        .status(409)
        .json({ error: "matériau déjà existant pour ce fournisseur" });

    const [r] = await pool.execute(
      "INSERT INTO materials (name, type, company_id) VALUES (?,?,?)",
      [name.trim(), type, company_id]
    );
    res
      .status(201)
      .json({ id: r.insertId, name: name.trim(), type, company_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/materials/:id
 * Détail d'un matériau
 */
router.get("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute(
      `SELECT m.id, m.name, m.type, m.company_id, c.name AS company
       FROM materials m JOIN companies c ON c.id=m.company_id
       WHERE m.id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * PUT /api/private/materials/:id
 * Modifier un matériau
 */
router.put("/:id", async (req, res) => {
  const { name, type, company_id } = req.body || {};
  if (type && !TYPES.has(type))
    return res.status(400).json({ error: "type invalide" });

  try {
    const pool = await getPool();

    const [exists] = await pool.execute("SELECT id FROM materials WHERE id=?", [
      req.params.id,
    ]);
    if (!exists.length) return res.status(404).json({ error: "not_found" });

    if (company_id) {
      const [c] = await pool.execute("SELECT id FROM companies WHERE id=?", [
        company_id,
      ]);
      if (!c.length)
        return res.status(400).json({ error: "company_id inconnu" });
    }

    const set = [];
    const params = [];
    if (name?.trim()) {
      set.push("name=?");
      params.push(name.trim());
    }
    if (type) {
      set.push("type=?");
      params.push(type);
    }
    if (company_id) {
      set.push("company_id=?");
      params.push(company_id);
    }
    if (!set.length)
      return res.status(400).json({ error: "aucune donnée à mettre à jour" });

    params.push(req.params.id);
    await pool.execute(
      `UPDATE materials SET ${set.join(", ")} WHERE id=?`,
      params
    );

    const [row] = await pool.execute(
      "SELECT id, name, type, company_id FROM materials WHERE id=?",
      [req.params.id]
    );
    res.json(row[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/private/materials/:id
 * Supprimer un matériau
 */
router.delete("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const [r] = await pool.execute("DELETE FROM materials WHERE id=?", [
      req.params.id,
    ]);
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "not_found" });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
