import express from "express";
import { request, getRequests } from "../controllers/request.controller.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.route("/request").post(request).get(getRequests);

export default router;