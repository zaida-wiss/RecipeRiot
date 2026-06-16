import { Router } from "express";
import {
  exportMyData,
  hardDeleteMe,
  softDeleteMe,
} from "../controllers/gdprController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/export", authenticate, asyncHandler(exportMyData));
router.delete("/me", authenticate, asyncHandler(softDeleteMe));
router.delete("/me/hard", authenticate, asyncHandler(hardDeleteMe));

export default router;