// src/controllers/usersController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { NotFoundError, ConflictError } from '../errors/AppError';

// GET /api/v1/users
exports.getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/:id
exports.getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError('Användaren hittades inte');
      res.json(user);

  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users
exports.createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await User.findOne({email: req.body.email})

    if (existing) {throw new ConflictError('Användaren finns redan');
  }
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/users/:id
exports.updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) {
  res.status(404).json({ message: 'Användaren hittades inte' });
  return;
    }
  res.json(user);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/users/:id
exports.deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
    res.status(404).json({ message: 'Användaren hittades inte' });
    return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};