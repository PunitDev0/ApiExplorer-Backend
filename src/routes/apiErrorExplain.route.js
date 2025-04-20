import { Router } from "express";
import { ApiErrorExplain } from "../controllers/apierrorExplain.controller.js";

const router = Router();


// Google Sign-In
router.post('/explain', ApiErrorExplain);



export default router;