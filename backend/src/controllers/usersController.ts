import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';
import { User } from '../types';

const users: User[] = [];

export const getAllUsers = (_req: Request, res: Response) => {
  res.json(users);
};

export const getUserById = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const user = users.find(u => u.id === id);

    if (!user) throw new NotFoundError('Användaren hittades inte');

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = {
      id: users.length + 1,
      ...req.body,
    };

    users.push(newUser);

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

export const updateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const user = users.find(u => u.id === id);

    if (!user) throw new NotFoundError('Användaren hittades inte');

    Object.assign(user, req.body);

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const index = users.findIndex(u => u.id === id);

    if (index === -1) throw new NotFoundError('Användaren hittades inte');

    users.splice(index, 1);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};