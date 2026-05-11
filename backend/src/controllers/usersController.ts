// src/controllers/usersController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { NotFoundError, ConflictError } from '../errors/AppError';

// GET /api/v1/users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/:id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.validatedParams;
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('Användaren hittades inte');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users
export const createUser = async (req: Request, res: Response) => {
  try {
    // Kontrollera om e-postadressen redan finns (409 Conflict)
    const existing = await User.findOne({ email: req.validatedBody.email });
    if (existing) throw new ConflictError('E-postadressen är redan registrerad');

    const user = await User.create(req.validatedBody);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.validatedParams;
    const user = await User.findByIdAndUpdate(
      id,
      req.validatedBody,
      { new: true, runValidators: true }
    );
    if (!user) throw new NotFoundError('Användaren hittades inte');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.validatedParams;
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new NotFoundError('Användaren hittades inte');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};