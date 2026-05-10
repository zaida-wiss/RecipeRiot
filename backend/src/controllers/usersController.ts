// src/controllers/usersController.ts
import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel";
import type { CreateUserBodyType, UpdateUserBodyType } from "../types/userType";
import { AppError } from "../middleware/errorHandler";

// Controller-funktionerna körs efter routes och validation middleware.
// Här ligger databaslogiken, medan fel skickas vidare till errorHandler med next(error).

// Hämtar och returnerar alla users.
const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    // User.find() hämtar alla dokument från users-collection i MongoDB.
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
    // findById returnerar antingen ett dokument eller null om id:t saknas i databasen.
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
    // req.body är redan kontrollerad av validateCreateUser i routern.
    const { username, email, password } = req.body as CreateUserBodyType;

    // Klienten skickar password, men databasen sparar passwordHash.
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

    // PUT uppdaterar hela användarens skrivbara fält.
    user.username = username;
    user.email = email;
    user.passwordHash = `hashed-${password}`;

    // save() sparar ändringarna och uppdaterar updatedAt via Mongoose timestamps.
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

    // PATCH uppdaterar bara de fält som faktiskt skickades med i request body.
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

    // deleteOne tar bort just detta dokument från databasen.
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
