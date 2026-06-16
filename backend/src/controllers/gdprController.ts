import type { Request, Response } from "express";
import { Recipe } from "../models/Recipe.js";
import { User } from "../models/User.js";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "../errors/AppError.js";

const SOFT_DELETE_RETENTION_DAYS = 90;


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

// DELETE /api/v1/gdpr/me/hard
export const hardDeleteMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError("Autentisering krävs");
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new NotFoundError("Användaren hittades inte");
  }

  // Om användaren är admin, validera att det inte är den sista admin:n
  if (user.role === "admin") {
    const activeAdminCount = await User.countDocuments({
      role: "admin",
      isDeleted: false,
    });

    if (activeAdminCount <= 1) {
      throw new ForbiddenError("Den sista adminen kan inte raderas");
    }
  }

  await Recipe.deleteMany({ createdBy: req.user.id });
  await User.findByIdAndDelete(req.user.id);

  req.log.info(
    { event: 'gdpr.user.hard_delete', userId: req.user.id },
    'User hard deleted account'
  );

  res.status(204).send();
};

// Automatisk cleanup av soft-deleted data efter 90 dagar
export const cleanupExpiredSoftDeletedData = async (): Promise<void> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - SOFT_DELETE_RETENTION_DAYS);

  const deletedUsers = await User.find({
    isDeleted: true,
    deletedAt: { $lt: cutoffDate },
  });

  let deletedCount = 0;
  for (const user of deletedUsers) {
    const userId = user._id.toString();
    await Recipe.deleteMany({ createdBy: userId });
    await User.findByIdAndDelete(user._id);
    deletedCount++;
  }

  if (deletedCount > 0) {
    console.log(
      `[GDPR Cleanup] Permanently deleted ${deletedCount} soft-deleted user(s) and their recipes`
    );
  }
};