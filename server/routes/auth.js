import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/login", (_req, res) => {
  res.render("login", { title: "Connexion" });
});

router.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "demo@meubles.fr" && password === "1234") {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token, user: { email } });
  }

  return res.status(401).json({ error: "Identifiants invalides" });
});

export default router;
