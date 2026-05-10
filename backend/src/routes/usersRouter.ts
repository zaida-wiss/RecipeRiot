// src/routes/usersRouter.ts
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserObject,
  updateUserField,
  // deleteUser
} from "../controllers/usersController";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUserObject);
router.patch("/:id", updateUserField);
// router.delete("/:id", deleteUser);

export default router;
