import { Router } from "express";
import { getPool } from "../../services/db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id, name FROM categories ORDER BY name ASC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "name requis" });
  try {
    const pool = await getPool();
    const [r] = await pool.execute("INSERT INTO categories (name) VALUES (?)", [
      name.trim(),
    ]);
    res.status(201).json({ id: r.insertId, name: name.trim() });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "name déjà utilisé" });
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "name requis" });
  try {
    const pool = await getPool();
    const [r] = await pool.execute("UPDATE categories SET name=? WHERE id=?", [
      name.trim(),
      id,
    ]);
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "not_found" });
    res.json({ id: Number(id), name: name.trim() });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "name déjà utilisé" });
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const [r] = await pool.execute("DELETE FROM categories WHERE id=?", [
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
