// routes/environment.js
import express from "express";
import {
  getEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from "../controllers/environment.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getEnvironments);
router.post("/", authMiddleware, createEnvironment);
router.put("/:id", authMiddleware, updateEnvironment);
router.delete("/:id", authMiddleware, deleteEnvironment);

export default router;