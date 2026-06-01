import type { Request, Response } from "express";
import { Recipe } from "../models/Recipe.js";
import { User } from "../models/User.js";
import { NotFoundError, UnauthorizedError } from "../errors/AppError.js";


// GET /api/v1/gdpr/export
export const exportMyData = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError("Autentisering krävs");
  }

  const user = await User.findOne({
    _id: req.user.id,
    isDeleted: false,
  });

  if (!user) {
    throw new NotFoundError("Användaren hittades inte");
  }

  const recipes = await Recipe.find({
    createdBy: req.user.id,
  });

  res.setHeader('Content-type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="reciperiot-my-DataView.json"'
  );

  res.json({
    exportedAt: new Date().toISOString(),
    user: {
      id: user._id.toString(),
      username: user.username,
      email:user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    recipes: recipes.map((recipe) => ({
      id: recipe._id.toString(),
      title: recipe.title,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      orginalRef: recipe.originalRef,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    })),
  });
};

// DELETE /api/v1/gdpr/me
export const softDeleteMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError("Autentisering krävs");
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.id, isDeleted: false },
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError("Användaren hittades inte");
  }

  req.log.info(
    { event: "gdpr.user.soft_delete", userId: req.user.id },
    "User soft deleted account"
  );

  res.status(204).send();
};