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

function notFound(res: Response) {
  return res.status(404).json({ message: 'Användaren hittades inte' });
}

function getInMemoryUserIndex(id: string) {
  const numericId = parseInt(id, 10);

  if (Number.isNaN(numericId)) {
    return -1;
  }

  return inMemoryUsers.findIndex((user) => user.id === numericId);
}

function handleInMemoryUser<T>(
  id: string,
  onFound: (user: { id: number; username: string; email: string }, index: number) => T,
  onMissing: () => T
) {
  const index = getInMemoryUserIndex(id);

  if (index === -1) {
    return onMissing();
  }

  return onFound(inMemoryUsers[index], index);
}

function isMongoObjectId(id: string) {
  return mongoose.isValidObjectId(id);
}

// ======== Helper Functions ========
// Wrap database operations with fallback error handling
async function tryDb<T>(fn: () => Promise<T | null>): Promise<T | null> {
  if (!(UserModel && mongoose.connection.readyState === 1)) return null;
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
  const isValidMongoId = isMongoObjectId(id);

  const dbUser = await tryDb(() =>
    isValidMongoId ? UserModel.findById(id).lean() : Promise.resolve(null)
  );
  if (dbUser) {
    return res.json(mapDbUser(dbUser));
  }

  return handleInMemoryUser(
    id,
    (user) => res.json(user),
    () => notFound(res)
  );
};

// POST /api/v1/users
const createUser = async (req: Request, res: Response) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ message: 'username och email krävs' });

  const created = await tryDb(() => UserModel.create({ username, email }));
  if (!created) {
    return res.status(500).json({ message: 'Kunde inte skapa användare' });
  } return res.status(201).json(mapDbUser(created));
};

// PUT /api/v1/users/:id
const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const isValidMongoId = isMongoObjectId(id);

  const updated = await tryDb(() =>
    isValidMongoId ? UserModel.findByIdAndUpdate(id, req.body, { new: true }).lean() : Promise.resolve(null)
  );
  if (updated) {
    return res.json(mapDbUser(updated));
  }

  return handleInMemoryUser(
    id,
    (_user, index) => {
      inMemoryUsers[index] = { id: inMemoryUsers[index].id, ...req.body };
      return res.json(inMemoryUsers[index]);
    },
    () => notFound(res)
  );
};

// DELETE /api/v1/users/:id
const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const isValidMongoId = isMongoObjectId(id);

  const deleted = await tryDb(() =>
    isValidMongoId ? UserModel.findByIdAndDelete(id).lean() : Promise.resolve(null)
  );
  if (deleted) {
    return res.status(204).send();
  }

  return handleInMemoryUser(
    id,
    (_user, index) => {
      inMemoryUsers.splice(index, 1);
      return res.status(204).send();
    },
    () => notFound(res)
  );
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };