import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from '../models/User';
import { ConflictError, UnauthorizedError } from "../errors/AppError"
import { AuthResponse, AuthUser, JwtPayload, UserResponse } from '../types';


//Helper
function toUserResponse(user: IUser): UserResponse {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}


function createToken(user:IUser): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET saknas i miljövariabler");
  }

  const payload: JwtPayload = {
    sub: user._id.toString(),
    email: user.email,
  };

  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as jwt.
    SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

export async function register(
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction,
)
