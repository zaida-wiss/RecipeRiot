import { Router } from "express";
import {
  exportMyData,
  hardDeleteMe,
  softDeleteMe,
} from "../controllers/gdprController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/export", authenticate, exportMyData);
router.delete("/me", authenticate, softDeleteMe);
router.delete("/me/hard", authenticate, hardDeleteMe);

export default router;