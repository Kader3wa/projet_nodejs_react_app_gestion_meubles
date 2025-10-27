import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Welcome to the Meuble Management API" });
});

export default router;
