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

// Läs-routen för listan behöver ingen body- eller params-validering.
router.get("/", getAllUsers);
router.get("/:id", validateObjectIdParam, getUserById);

// POST har ingen :id i URL:en, så här valideras bara request body.
router.post("/", validateCreateUser, createUser);

// PUT/PATCH/DELETE har :id och validerar därför params innan controllern.
router.put("/:id", validateObjectIdParam, validateUpdateUserObject, updateUserObject);
router.patch("/:id", validateObjectIdParam, validateUpdateUserField, updateUserField);
router.delete("/:id", validateObjectIdParam, deleteUser);

export default router;
