// src/controllers/usersController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// In-memory fallback users (keeps previous API behavior for development)
const inMemoryUsers = [
  { id: 1, username: 'anna_kocker', email: 'anna@example.com' },
  { id: 2, username: 'erik_mat', email: 'erik@example.com' },
  { id: 3, username: 'test', email: 'test@example.com' },
];

let UserModel: any;
try {
  // require here to avoid module resolution issues with ts-node + compiled output
  // models/User.ts exports both named `User` and module.exports for compatibility.
  UserModel = require('../models/User').User;
} catch (e) {
  UserModel = null;
}

function mapDbUser(dbUser: any) {
  return { id: dbUser._id.toString(), username: dbUser.username, email: dbUser.email };
}

// GET /api/v1/users
const getAllUsers = async (_req: Request, res: Response) => {
  if (UserModel && mongoose.connection.readyState === 1) {
    try {
      const users = await UserModel.find().lean();
      return res.json(users.map(mapDbUser));
    } catch (err) {
      console.warn('DB error in getAllUsers, falling back to in-memory', err);
    }
  }

  return res.json(inMemoryUsers);
};

// GET /api/v1/users/:id
const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (UserModel && mongoose.isValidObjectId(id) && mongoose.connection.readyState === 1) {
    try {
      const user = await UserModel.findById(id).lean();
      if (!user) return res.status(404).json({ message: 'Användaren hittades inte' });
      return res.json(mapDbUser(user));
    } catch (err) {
      console.warn('DB error in getUserById, falling back to in-memory', err);
    }
  }

  // fallback: treat id as numeric index id
  const numericId = parseInt(id, 10);
  if (!Number.isNaN(numericId)) {
    const user = inMemoryUsers.find(u => u.id === numericId);
    if (!user) return res.status(404).json({ message: 'Användaren hittades inte' });
    return res.json(user);
  }

  return res.status(404).json({ message: 'Användaren hittades inte' });
};

// POST /api/v1/users
const createUser = async (req: Request, res: Response) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ message: 'username och email krävs' });

  if (UserModel && mongoose.connection.readyState === 1) {
    try {
      const created = await UserModel.create({ username, email });
      return res.status(201).json(mapDbUser(created));
    } catch (err) {
      console.warn('DB error in createUser, falling back to in-memory', err);
    }
  }

  const newUser = { id: inMemoryUsers.length + 1, username, email };
  inMemoryUsers.push(newUser);
  return res.status(201).json(newUser);
};

// PUT /api/v1/users/:id
const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (UserModel && mongoose.isValidObjectId(id) && mongoose.connection.readyState === 1) {
    try {
      const updated = await UserModel.findByIdAndUpdate(id, req.body, { new: true }).lean();
      if (!updated) return res.status(404).json({ message: 'Användaren hittades inte' });
      return res.json(mapDbUser(updated));
    } catch (err) {
      console.warn('DB error in updateUser, falling back to in-memory', err);
    }
  }

  const numericId = parseInt(id, 10);
  if (!Number.isNaN(numericId)) {
    const index = inMemoryUsers.findIndex(u => u.id === numericId);
    if (index === -1) return res.status(404).json({ message: 'Användaren hittades inte' });
    inMemoryUsers[index] = { id: numericId, ...req.body };
    return res.json(inMemoryUsers[index]);
  }

  return res.status(404).json({ message: 'Användaren hittades inte' });
};

// DELETE /api/v1/users/:id
const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (UserModel && mongoose.isValidObjectId(id) && mongoose.connection.readyState === 1) {
    try {
      const deleted = await UserModel.findByIdAndDelete(id).lean();
      if (!deleted) return res.status(404).json({ message: 'Användaren hittades inte' });
      return res.status(204).send();
    } catch (err) {
      console.warn('DB error in deleteUser, falling back to in-memory', err);
    }
  }

  const numericId = parseInt(id, 10);
  if (!Number.isNaN(numericId)) {
    const index = inMemoryUsers.findIndex(u => u.id === numericId);
    if (index === -1) return res.status(404).json({ message: 'Användaren hittades inte' });
    inMemoryUsers.splice(index, 1);
    return res.status(204).send();
  }

  return res.status(404).json({ message: 'Användaren hittades inte' });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };