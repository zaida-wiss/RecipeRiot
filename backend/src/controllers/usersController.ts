// src/controllers/usersController.ts
import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel";
import type { CreateUserBodyType, UpdateUserBodyType } from "../types/userType";
import { AppError } from "../middleware/errorHandler";

//Hämtar och returnerar alla users.
const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

//Hämtar en användare baserat på id från URL-parametern.
const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Användaren hittades inte.", 404));
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

//Skapar en ny användare från data i request body.
const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const { username, email, password } = req.body as CreateUserBodyType;

    const newUser = await User.create({
      username,
      email,
      passwordHash: `hashed-${password}`,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return next(error);
  }
};

//Uppdaterar hela användar-objektet.
const updateUserObject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Användaren hittades inte.", 404));
    }

    const { username, email, password } = req.body as CreateUserBodyType;

    user.username = username;
    user.email = email;
    user.passwordHash = `hashed-${password}`;

    const updatedUser = await user.save();

    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
};



//Uppdaterar en eller flera användar-fält.
const updateUserField = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Användaren hittades inte.", 404));
    }

    const { username, email, isActive } = req.body as UpdateUserBodyType;

    if (username !== undefined) {
      user.username = username;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    const updatedUser = await user.save();

    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
};




// Tar bort en användare.
const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Användaren hittades inte.", 404));
    }

    await user.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};



export {
  getAllUsers,
  getUserById,
  createUser,
  updateUserObject,
  updateUserField,
  deleteUser,
};
