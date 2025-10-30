import { Router } from "express";
import { getPool } from "../../services/db.js";

const router = Router();

/**
 * GET /api/private/builds
 * Liste des fabrications, avec filtre optionnel par furniture_model_id
 */
router.get("/", async (req, res) => {
  const modelId = req.query.model_id ? Number(req.query.model_id) : null;
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT b.id, b.furniture_model_id, b.ref, b.date_creation, b.destination, b.notes,
              m.name AS model_name
       FROM builds b
       JOIN furniture_models m ON m.id = b.furniture_model_id
       WHERE (? IS NULL OR b.furniture_model_id = ?)
       ORDER BY b.date_creation DESC, b.id DESC`,
      [modelId, modelId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/private/builds/:id
 * Détail d'une fabrication, avec la liste de ses matériaux
 */
router.get("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const [[build]] = await pool.query(
      `SELECT b.id, b.furniture_model_id, b.ref, b.date_creation, b.destination, b.notes,
              m.name AS model_name, c.id AS category_id, c.name AS category_name
       FROM builds b
       JOIN furniture_models m ON m.id = b.furniture_model_id
       JOIN categories c ON c.id = m.category_id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!build) return res.status(404).json({ error: "not_found" });

    const [materials] = await pool.query(
      `SELECT bm.material_id AS id, mat.name, mat.type, mat.company_id,
              bm.quantity, bm.unit, bm.cost_unit
       FROM build_materials bm
       JOIN materials mat ON mat.id = bm.material_id
       WHERE bm.build_id = ?
       ORDER BY mat.name ASC`,
      [req.params.id]
    );
    res.json({ ...build, materials });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/private/builds
 * Création d'une nouvelle fabrication
 */
router.post("/", async (req, res) => {
  const {
    furniture_model_id,
    ref = null,
    date_creation = null,
    destination = null,
    notes = null,
  } = req.body || {};
  if (!Number.isInteger(Number(furniture_model_id)))
    return res.status(400).json({ error: "furniture_model_id invalide" });
  try {
    const pool = await getPool();
    const [[model]] = await pool.query(
      "SELECT id FROM furniture_models WHERE id=?",
      [furniture_model_id]
    );
    if (!model)
      return res.status(400).json({ error: "furniture_model_id inconnu" });

    const [r] = await pool.execute(
      `INSERT INTO builds (furniture_model_id, ref, date_creation, destination, notes)
       VALUES (?,?,?,?,?)`,
      [furniture_model_id, ref, date_creation, destination, notes]
    );
    res.status(201).json({
      id: r.insertId,
      furniture_model_id,
      ref,
      date_creation,
      destination,
      notes,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * PUT /api/private/builds/:id
 * Modification d'une fabrication
 */
router.put("/:id", async (req, res) => {
  const { furniture_model_id, ref, date_creation, destination, notes } =
    req.body || {};
  if (
    furniture_model_id !== undefined &&
    !Number.isInteger(Number(furniture_model_id))
  )
    return res.status(400).json({ error: "furniture_model_id invalide" });

  const fields = [],
    params = [];
  if (furniture_model_id !== undefined) {
    fields.push("furniture_model_id=?");
    params.push(furniture_model_id);
  }
  if (ref !== undefined) {
    fields.push("ref=?");
    params.push(ref ?? null);
  }
  if (date_creation !== undefined) {
    fields.push("date_creation=?");
    params.push(date_creation ?? null);
  }
  if (destination !== undefined) {
    fields.push("destination=?");
    params.push(destination ?? null);
  }
  if (notes !== undefined) {
    fields.push("notes=?");
    params.push(notes ?? null);
  }

  if (!fields.length) return res.json({ id: Number(req.params.id) });

  try {
    const pool = await getPool();
    const [[exists]] = await pool.query("SELECT id FROM builds WHERE id=?", [
      req.params.id,
    ]);
    if (!exists) return res.status(404).json({ error: "not_found" });

    if (furniture_model_id !== undefined) {
      const [[model]] = await pool.query(
        "SELECT id FROM furniture_models WHERE id=?",
        [furniture_model_id]
      );
      if (!model)
        return res.status(400).json({ error: "furniture_model_id inconnu" });
    }

    params.push(req.params.id);
    await pool.execute(
      `UPDATE builds SET ${fields.join(", ")} WHERE id=?`,
      params
    );
    res.json({ id: Number(req.params.id) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/private/builds/:id
 * Suppression d'une fabrication
 */
router.delete("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const [r] = await pool.execute("DELETE FROM builds WHERE id=?", [
      req.params.id,
    ]);
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "not_found" });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/private/builds/:id/materials
 * Ajout ou mise à jour d'un matériau dans une fabrication
 */
router.post("/:id/materials", async (req, res) => {
  const buildId = Number(req.params.id);
  const {
    material_id,
    quantity = 0,
    unit = "u",
    cost_unit = 0,
  } = req.body || {};
  if (!Number.isInteger(Number(material_id)))
    return res.status(400).json({ error: "material_id invalide" });

  try {
    const pool = await getPool();
    const [[build]] = await pool.query("SELECT id FROM builds WHERE id=?", [
      buildId,
    ]);
    if (!build) return res.status(404).json({ error: "build_not_found" });

    const [[mat]] = await pool.query("SELECT id FROM materials WHERE id=?", [
      material_id,
    ]);
    if (!mat) return res.status(400).json({ error: "material_id inconnu" });

    await pool.execute(
      `INSERT INTO build_materials (build_id, material_id, quantity, unit, cost_unit)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE quantity=VALUES(quantity), unit=VALUES(unit), cost_unit=VALUES(cost_unit)`,
      [buildId, material_id, quantity, unit, cost_unit]
    );
    res
      .status(201)
      .json({ build_id: buildId, material_id, quantity, unit, cost_unit });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
