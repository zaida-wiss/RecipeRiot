// src/controllers/usersController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import type { Model } from 'mongoose';
import type { IUser } from '../models/User';

// Enkel, workshop-anpassad controller — inga avancerade hjälpfunktioner.
let UserModel: Model<IUser> | null = null;
try {
  UserModel = require('../models/User').User;
} catch (e) {
  UserModel = null;
}

function mapDbUser(user: any) {
  return { id: user._id?.toString?.() ?? String(user._id), username: user.username, email: user.email };
}

function isValidId(id: string) {
  return mongoose.isValidObjectId(id);
}

function checkDb(res: Response): boolean {
  if (!UserModel || mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'Database unavailable' });
    return false;
  }
  return true;
}

function validateId(id: string, res: Response): boolean {
  if (!isValidId(id)) {
    res.status(400).json({ error: 'Invalid id-format' });
    return false;
  }
  return true;
}

// GET /api/v1/users
const getAllUsers = async (_req: Request, res: Response) => {
  if (!checkDb(res)) return;

  try {
    const users = await UserModel!.find().lean();
    return res.json({ data: users.map(mapDbUser) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not fetch users' });
  }
};

// GET /api/v1/users/:id
const getUserById = async (req: Request, res: Response) => {
  if (!validateId(req.params.id, res)) return;
  if (!checkDb(res)) return;

  try {
    const user = await UserModel!.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ data: mapDbUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/v1/users
const createUser = async (req: Request, res: Response) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ error: 'username and email are required' });
  if (!checkDb(res)) return;

  try {
    const created = await UserModel!.create({ username, email });
    const payload = mapDbUser(created);
    res.location(`/api/v1/users/${payload.id}`);
    return res.status(201).json({ data: payload });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    if (error.code === 11000) return res.status(400).json({ error: 'Duplicate key' });
    return res.status(500).json({ error: "Couldn't create user" });
  }
};

// PATCH /api/v1/users/:id
const updateUser = async (req: Request, res: Response) => {
  if (!validateId(req.params.id, res)) return;
  if (!checkDb(res)) return;

  try {
    const updated = await UserModel!.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ data: mapDbUser(updated) });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: "Couldn't update user" });
  }
};

// DELETE /api/v1/users/:id
const deleteUser = async (req: Request, res: Response) => {
  if (!validateId(req.params.id, res)) return;
  if (!checkDb(res)) return;

  try {
    const deleted = await UserModel!.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Couldn't delete user" });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };