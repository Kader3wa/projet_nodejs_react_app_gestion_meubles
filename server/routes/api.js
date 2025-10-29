import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import categoriesRouter from "./private/categories.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Bienvenue, sur l'API de gestion des meubles" });
});

router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user,
  });
});

router.use("/private/categories", verifyToken, categoriesRouter);

export default router;
