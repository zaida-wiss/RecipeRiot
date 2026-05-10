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
import { validateObjectIdParam } from "../middleware/validateParams";

const router = Router();

// Läs-routes behöver ingen body-validering.
router.get("/", getAllUsers);
router.get("/:id", getUserById);

// Skriv-routes kör validation middleware innan controllern.
router.post("/", validateObjectIdParam, validateCreateUser, createUser);
router.put("/:id", validateObjectIdParam, validateUpdateUserObject, updateUserObject);
router.patch("/:id", validateObjectIdParam, validateUpdateUserField, updateUserField);
router.delete("/:id", validateObjectIdParam, deleteUser);

export default router;
