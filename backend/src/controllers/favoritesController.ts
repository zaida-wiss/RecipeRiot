// src/controllers/favoritesController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Recipe } from '../models/Recipe.js';
import { NotFoundError, UnauthorizedError } from '../errors/AppError.js';

// GET /api/v1/favorites
export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new UnauthorizedError();

    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) throw new NotFoundError('Användaren hittades inte');

    res.json({ data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/favorites/:recipeId
export const addFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { recipeId } = req.params;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new NotFoundError('Receptet hittades inte');

    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favorites: recipeId } },
      { new: true }
    );

    res.json({ message: 'Recept tillagt i favoriter' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/favorites/:recipeId
export const removeFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { recipeId } = req.params;

    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: recipeId } },
      { new: true }
    );

    res.json({ message: 'Recept borttaget från favoriter' });
  } catch (error) {
    next(error);
  }
};