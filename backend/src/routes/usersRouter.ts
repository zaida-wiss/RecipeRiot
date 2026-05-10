// src/routes/usersRouter.ts
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserObject,
  updateUserField,
  deleteUser
} from "../controllers/usersController";
import {
  validateCreateUser,
  validateUpdateUserField,
  validateUpdateUserObject,
} from "../middleware/validateUser";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", validateCreateUser, createUser);
router.put("/:id", validateUpdateUserObject, updateUserObject);
router.patch("/:id", validateUpdateUserField, updateUserField);
router.delete("/:id", deleteUser);

export default router;
