import { Router } from "express";

import bookRouter from "./book.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/books", bookRouter);

export default router;
