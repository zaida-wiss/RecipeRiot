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

// ======== Helper Functions ========
// Check if database is ready (replaces repeated compound condition)
function dbReady(): boolean {
  return Boolean(UserModel && mongoose.connection.readyState === 1);
}

// Wrap database operations with fallback error handling
async function tryDb<T>(fn: () => Promise<T | null>): Promise<T | null> {
  if (!dbReady()) return null;
  try {
    return await fn();
  } catch (err) {
    console.warn('DB error:', err);
    return null;
  }
}

// GET /api/v1/users
const getAllUsers = async (_req: Request, res: Response) => {
  const users = await tryDb(() => UserModel.find().lean() as any);
  if (users && Array.isArray(users)) {
    return res.json(users.map(mapDbUser));
  }
  return res.json(inMemoryUsers);
};

// GET /api/v1/users/:id
const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const isValidMongoId = mongoose.isValidObjectId(id);

  const dbUser = await tryDb(() =>
    isValidMongoId ? UserModel.findById(id).lean() : Promise.resolve(null)
  );
  if (dbUser) {
    return res.json(mapDbUser(dbUser));
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

  const created = await tryDb(() => UserModel.create({ username, email }));
  if (created) {
    return res.status(201).json(mapDbUser(created));
  }

  const newUser = { id: inMemoryUsers.length + 1, username, email };
  inMemoryUsers.push(newUser);
  return res.status(201).json(newUser);
};

// PUT /api/v1/users/:id
const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const isValidMongoId = mongoose.isValidObjectId(id);

  const updated = await tryDb(() =>
    isValidMongoId ? UserModel.findByIdAndUpdate(id, req.body, { new: true }).lean() : Promise.resolve(null)
  );
  if (updated) {
    return res.json(mapDbUser(updated));
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
  const isValidMongoId = mongoose.isValidObjectId(id);

  const deleted = await tryDb(() =>
    isValidMongoId ? UserModel.findByIdAndDelete(id).lean() : Promise.resolve(null)
  );
  if (deleted) {
    return res.status(204).send();
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