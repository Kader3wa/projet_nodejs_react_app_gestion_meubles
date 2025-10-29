import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import categoriesRouter from "./private/categories.js";
import materialsRouter from "./private/materials.js";
import companiesRouter from "./private/companies.js";
import furnitureModelsRouter from "./private/furniture_models.js";
import buildsRouter from "./private/builds.js";
import tagsRouter from "./private/tags.js";

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
router.use("/private/materials", verifyToken, materialsRouter);
router.use("/private/companies", verifyToken, companiesRouter);
router.use("/private/furniture_models", verifyToken, furnitureModelsRouter);
router.use("/private/builds", verifyToken, buildsRouter);
router.use("/private/tags", verifyToken, tagsRouter);

export default router;
