import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, type IUser } from '../models/User.js';
import { ConflictError, UnauthorizedError } from '../errors/AppError.js';
import { env } from "../config/env.js";
import type { AuthResponse, AuthUser, JwtPayload, UserResponse } from '../types/index.js';


// Helper: gör om ett Mongoose User-dokument till ett säkert API-svar.
// Viktigt: vi returnerar inte passwordHash.
 function toUserResponse(user: IUser): UserResponse {
   return {
     id: user._id.toString(),
     username: user.username,
     email: user.email,
     role: user.role,
     createdAt: user.createdAt,
     updatedAt: user.updatedAt,
   };
 }

 // Helper: skapar JWT-token.
function createToken(user: IUser): string {
   const secret = env.JWT_SECRET;

   if (!secret) {
     throw new Error('JWT_SECRET saknas i miljövariabler');
   }
     // sub betyder "subject" och används ofta som användarens id i JWT.
  const payload: JwtPayload = {
    sub: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
  };

   const options: jwt.SignOptions = {
     expiresIn: (env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'],
   };

   return jwt.sign(payload, secret, options);
 }

// POST /api/v1/auth/register
export const register = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> =>{
  try {
    // validatedBody kommer från validateRequest-middleware.
    // Vi använder validerad data, inte rå req.body.
    const { username, email, password } = req.validatedBody;
    // Vitlista queryn: sök bara på email och username.
    // Gör inte User.findOne(req.body).
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictError('E-postadressen eller användarnamnet är redan registrerat');
    }

    const saltRounds = Number(env.BCRYPT_SALT_ROUNDS || 10);


    // men saltRounds kommer från .env.
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

// POST /api/v1/auth/login
export const login = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> =>{
  try {
    const { identifier, password } = req.validatedBody;
    // passwordHash har select: false i modellen.
    // Därför måste vi aktivt ta med det vid login.
    const user = await User.findOne({
      isDeleted: false,
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
      ],
    }).select('+passwordHash');

    if (!user) {
    // Samma felmeddelande oavsett om identifier eller password är fel.
    // Då hjälper vi inte en angripare att lista ut vilka konton som finns.
      throw new UnauthorizedError('Felaktigt användarnamn/e-post eller lösenord');
    }
    // Jämför inkommande password med hashad version i databasen.
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Felaktigt användarnamn/e-post eller lösenord');
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

// GET /api/v1/auth/me
export const getMe = async (
  req: Request,
  res: Response<{ message: string; user: AuthUser }>,
  next: NextFunction
): Promise<void> =>{
  try {
    if (!req.user) {
      throw new UnauthorizedError('Autentisering krävs');
    }

    res.json({
      message: "Åtkomst beviljad till skyddad sida",
      user: req.user, });
  } catch (error) {
    next(error);
  }
};


export const getAdminStatus = async (
  req: Request,
  res: Response<{ message: string; user: AuthUser }>,
  next: NextFunction
): Promise<void> => {
  try {
    if(!req.user) {
      throw new UnauthorizedError("Autentiering krävs");
    }

    res.json({
      message: "Åtkomst beviljad till admin-sida",
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
