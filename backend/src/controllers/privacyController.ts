import { Request, Response, NextFunction } from "express";
import { Recipe } from "../models/Recipe.js";
import { User } from "../models/User.js";
import { NotFoundError, UnauthorizedError } from "../errors/AppError.js";

export const exportMyData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Autentisering krävs");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new NotFoundError("Användaren hittades inte");
    }

    const recipes = await Recipe.find({ createdBy: req.user.id });

    res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      recipes,
    });
  } catch (error) {
    next(error);
  }
  };

  export const deleteMyAccount =  async (
    req: Request,
    res: Response,
    next: NextFunction
  ):Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Autentisering krävs");
      }

      await Recipe.updateMany(
        { createdBy: req.user.id },
        { $set: { createdBy: "Raderad användare"}}
      );

      const deletedUser = await User.findByIdAndDelete(req.user.id);

      if (!deletedUser) {
        throw new NotFoundError("Användare hittades inte");
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };