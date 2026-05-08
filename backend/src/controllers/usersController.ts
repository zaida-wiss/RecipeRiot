// src/controllers/usersController.ts
import { Request, Response } from "express";
import {
  UserModelTypes,
  UserResponseTypes,
  CreateUserBodyTypes,
  UpdateUserBodyTypes,
} from "../types/usersTypes";

const users: UserModelTypes[] = [];

const toUserResponse = (user: UserModelTypes): UserResponseTypes => {
  const { passwordHash, ...userResponse } = user;
  return userResponse;
};

//Hämtar och returnerar alla users.
export const getAllUsers = (_req: Request, res: Response) => {
  return res.json(users.map(toUserResponse));
};

//Hämtar en användare baserat på id från URL-parametern.
export const getUserById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = users.find((item) => item.id === id);

  if (!user) {
    return res.status(404).json({ message: "Användaren hittades inte" });
  }

  return res.json(toUserResponse(user));
};

//Skapar en ny användare från data i request body.
export const createUser = (req: Request, res: Response) => {
  const { username, email, password }: CreateUserBodyTypes = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email och password krävs" });
  }

  const newUser: UserModelTypes = {
    id: users.length + 1,
    username,
    email,
    role: "user",
    passwordHash: `hashed-${password}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };

  users.push(newUser);

  return res.status(201).json(toUserResponse(newUser));
};

//Uppdaterar hela användar-objektet.
export const updateUserObject = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = users.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Användaren hittades inte" });
  }

  const { username, email, password }: CreateUserBodyTypes = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email och password krävs" });
  }

  const updatedUser: UserModelTypes = {
    id,
    username,
    email,
    role: users[index].role,
    passwordHash: `hashed-${password}`,
    createdAt: users[index].createdAt,
    updatedAt: new Date(),
    isActive: users[index].isActive,
  };

  users[index] = updatedUser;

  return res.json(toUserResponse(updatedUser));
};

//Uppdaterar en eller flera användar-fält.
export const updateUserField = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = users.find((item) => item.id === id);

  if (!user) {
    return res.status(404).json({ message: "Användaren hittades inte" });
  }

  const { username, email, isActive }: UpdateUserBodyTypes = req.body;

  if (username === undefined && email === undefined && isActive === undefined) {
    return res.status(400).json({ message: "Skicka minst ett fält att uppdatera" });
  }

  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (isActive !== undefined) user.isActive = isActive;

  user.updatedAt = new Date();

  return res.json(toUserResponse(user));
};

//Tar bort en användare.
export const deleteUser = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = users.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Användaren hittades inte" });
  }

  users.splice(index, 1);

  return res.status(204).send();
};
