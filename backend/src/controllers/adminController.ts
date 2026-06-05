import type { Request, Response, NextFunction } from "express";
import { User, type IUser } from "../models/User.js";
import { Recipe } from "../models/Recipe.js";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/AppError.js";

// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

/**
 * Validera att requesten har autentiserad användare.
 */
function requireAuth(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError("Autentisering krävs");
  }
  return req.user.id;
}

/**
 * Hämta och validera att målanvändaren existerar.
 */
async function getTargetUser(id: string): Promise<IUser> {
  const user = await User.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!user) {
    throw new NotFoundError("Användaren hittades inte");
  }

  return user;
}

/**
 * Validera att vi inte försöker radera andra admins.
 * Admins kan bara radera sig själva.
 */
async function validateAdminDeletion(
  targetUser: IUser,
  isDeletingSelf: boolean
): Promise<void> {
  if (!targetUser.role || targetUser.role !== "admin") {
    return;
  }

  if (isDeletingSelf) {
    return;
  }

  // Admin försöker radera en annan admin
  throw new ForbiddenError("Admin kan inte radera andra admins");
}

/**
 * Validera att vi inte raderar den sista adminen.
 */
async function validateNotLastAdmin(targetUser: IUser): Promise<void> {
  if (!targetUser.role || targetUser.role !== "admin") {
    return;
  }

  const activeAdminCount = await User.countDocuments({
    role: "admin",
    isDeleted: false,
  });

  if (activeAdminCount <= 1) {
    throw new ForbiddenError("Den sista adminen kan inte raderas");
  }
}

/**
 * Markera användare och hennes recept som raderade.
 */
async function softDeleteUserAndRecipes(
  targetUser: IUser,
  deletedAt: Date
): Promise<void> {
  targetUser.isDeleted = true;
  targetUser.deletedAt = deletedAt;
  await targetUser.save();

  await Recipe.updateMany(
    {
      createdBy: targetUser._id.toString(),
      deletedAt: null,
    },
    { deletedAt }
  );
}

// ─── Controller ────────────────────────────────────────────────────────────────

export const softDeleteUserAsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = requireAuth(req);
    const { id } = req.validatedParams;

    const targetUser = await getTargetUser(id);
    const isDeletingSelf = targetUser._id.toString() === adminId;

    await validateAdminDeletion(targetUser, isDeletingSelf);
    await validateNotLastAdmin(targetUser);

    const deletedAt = new Date();
    await softDeleteUserAndRecipes(targetUser, deletedAt);

    req.log.info(
      {
        event: "admin.user.soft_delete",
        adminId,
        targetUserId: targetUser._id.toString(),
      },
      "Admin soft deleted user"
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Hämta och validera att receptet existerar.
 */
async function getTargetRecipe(id: string) {
  const recipe = await Recipe.findOne({
    _id: id,
    deletedAt: null,
  });

  if (!recipe) {
    throw new NotFoundError("Receptet hittades inte");
  }

  return recipe;
}

/**
 * Markera recept som raderat.
 */
async function softDeleteRecipe(recipe: any): Promise<void> {
  recipe.deletedAt = new Date();
  await recipe.save();
}

export const softDeleteRecipeAsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = requireAuth(req);
    const { id } = req.validatedParams;

    const recipe = await getTargetRecipe(id);
    await softDeleteRecipe(recipe);

    req.log.info(
      {
        event: "admin.recipe.soft_delete",
        adminId,
        targetRecipeId: recipe._id.toString(),
      },
      "Admin soft deleted recipe"
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};