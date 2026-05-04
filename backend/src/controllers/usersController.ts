// src/controllers/usersController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';

let UserModel: any;
try {
  UserModel = require('../models/User').User;
} catch (e) {
  UserModel = null;
}

function mapDbUser(dbUser: any) {
  return { id: dbUser._id.toString(), username: dbUser.username, email: dbUser.email };
}

function isMongoObjectId(id: string) {
  return mongoose.isValidObjectId(id);
}

function isDatabaseReady() {
  return Boolean(UserModel && mongoose.connection.readyState === 1);
}

function serviceUnavailable(res: Response) {
  return res.status(503).json({ message: 'Databasen är inte tillgänglig' });
}

function notFound(res: Response) {
  return res.status(404).json({ message: 'Användaren hittades inte' });
}

function requireDatabase(res: Response) {
  if (!isDatabaseReady()) {
    return serviceUnavailable(res);
  }

  return null;
}

// Vi använder databasen som enda källa för användare.
async function tryDb<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!isDatabaseReady()) return null;
  try {
    return await fn();
  } catch (err) {
    console.warn('DB error:', err);
    return null;
  }
}

// GET /api/v1/users
const getAllUsers = async (_req: Request, res: Response) => {
  const unavailableResponse = requireDatabase(res);
  if (unavailableResponse) return unavailableResponse;

  const users = await tryDb(() => UserModel.find().lean() as any);
  if (!users) {
    return serviceUnavailable(res);
  }

  return res.json((Array.isArray(users) ? users : []).map(mapDbUser));
};

// GET /api/v1/users/:id
const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const isValidMongoId = isMongoObjectId(id);

  const unavailableResponse = requireDatabase(res);
  if (unavailableResponse) return unavailableResponse;

  const dbUser = await tryDb(() =>
    isValidMongoId ? UserModel.findById(id).lean() : Promise.resolve(null)
  );
  if (dbUser) {
    return res.json(mapDbUser(dbUser));
  }

  return notFound(res);
};

// POST /api/v1/users
const createUser = async (req: Request, res: Response) => {
  const unavailableResponse = requireDatabase(res);
  if (unavailableResponse) return unavailableResponse;

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

  const unavailableResponse = requireDatabase(res);
  if (unavailableResponse) return unavailableResponse;

  const updated = await tryDb(() =>
    isValidMongoId ? UserModel.findByIdAndUpdate(id, req.body, { new: true }).lean() : Promise.resolve(null)
  );
  if (updated) {
    return res.json(mapDbUser(updated));
  }

  return notFound(res);
};

// DELETE /api/v1/users/:id
const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const isValidMongoId = isMongoObjectId(id);

  const unavailableResponse = requireDatabase(res);
  if (unavailableResponse) return unavailableResponse;

  const deleted = await tryDb(() =>
    isValidMongoId ? UserModel.findByIdAndDelete(id).lean() : Promise.resolve(null)
  );
  if (deleted) {
    return res.status(204).send();
  }

  return notFound(res);
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };