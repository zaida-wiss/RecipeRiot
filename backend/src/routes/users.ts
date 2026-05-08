// src/routes/usersController.ts
import { Router } from "express";
const usersController = require("../controllers/usersController");

const router = Router();

router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteMovie);

