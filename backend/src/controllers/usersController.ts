// src/controllers/usersController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';

// GET /api/v1/users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// GET /api/v1/users/:id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Användaren hittades inte' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// POST /api/v1/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// PUT /api/v1/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Användaren hittades inte' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// DELETE /api/v1/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Användaren hittades inte' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};