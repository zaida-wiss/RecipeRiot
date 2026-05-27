import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  deleteMyAccount,
  exportMyData,
} from "../controllers/privacyController.js";

const router = Router();

router.get("/export", authenticate, exportMyData);

router.delete("/me", authenticate, deleteMyAccount);

export default router;