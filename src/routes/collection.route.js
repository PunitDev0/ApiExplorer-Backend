import express from "express";
import {
  createCollection,
  getCollections,
  updateCollection,
  deleteCollection,
  addRequestToCollection,
} from "../controllers/collection.controller.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.route("/").post(protect, createCollection).get(protect, getCollections);
router.route("/:id").put(protect, updateCollection).delete(protect, deleteCollection);
router.route("/add-request").post(protect, addRequestToCollection);

export default router