import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { ConflictError, UnauthorizedError } from '../errors/AppError';
import { AuthResponse, AuthUser, JwtPayload, UserResponse } from '../types';


// Helper
function toUserResponse(user: IUser): UserResponse {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}


function createToken(user: IUser): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET saknas i miljövariabler');
  }

  const payload: JwtPayload = {
    sub: user._id.toString(),
    email: user.email,
  };

  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

export async function register(
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { username, email, password } = req.validatedBody;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError('E-postadressen är redan registrerad');
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      username,
      email,
      passwordHash,
    });

    const token = createToken(user);

    res.status(201).json({
      token,
      user: toUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.validatedBody;

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      throw new UnauthorizedError('Felaktig e-post eller lösenord');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Felaktig e-post eller lösenord');
    }

    const token = createToken(user);

    res.json({
      token,
      user: toUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: Request,
  res: Response<{ user: AuthUser }>,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Autentisering krävs');
    }

    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
}
