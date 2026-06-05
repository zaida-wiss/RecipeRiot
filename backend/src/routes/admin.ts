import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validate.js";
import { idParamSchema } from "../schemas/user.schemas.js";
import {
  softDeleteUserAsAdmin,
  softDeleteRecipeAsAdmin,
} from "../controllers/adminController.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin"));

router.patch(
  "/users/:id/soft-delete",
  validateRequest({ params: idParamSchema }),
  softDeleteUserAsAdmin
);

router.patch(
  "/recipes/:id/soft-delete",
  validateRequest({ params: idParamSchema }),
  softDeleteRecipeAsAdmin
);

export default router;
