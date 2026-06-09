import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { User } from '../models/User.js';

function createPasswordResetToken(): { plainToken: string; tokenHash: string; expiresAt: Date } {
  const plainToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  return { plainToken, tokenHash, expiresAt };
}

export const requestPasswordReset = async (
  req: Request,
  res: Response<{ message: string; resetToken?: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.validatedBody;

    const user = await User.findOne({
      email,
      isDeleted: false,
    }).select('+passwordResetTokenHash +passwordResetExpiresAt');

    if (!user) {
      res.json({
        message: 'Om kontot finns har vi skickat instruktioner för att återställa lösenordet.',
      });
      return;
    }

    const { plainToken, tokenHash, expiresAt } = createPasswordResetToken();

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    res.json({
      message: 'Om kontot finns har vi skickat instruktioner för att återställa lösenordet.',
      ...(env.NODE_ENV !== 'production' ? { resetToken: plainToken } : {}),
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPasswordReset = async (
  req: Request,
  res: Response<{ message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.validatedBody;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      isDeleted: false,
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt');

    if (!user) {
      throw new UnauthorizedError('Reset-koden är ogiltig eller har gått ut');
    }

    const saltRounds = Number(env.BCRYPT_SALT_ROUNDS || 10);
    user.passwordHash = await bcrypt.hash(password, saltRounds);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.json({
      message: 'Lösenordet är uppdaterat. Du kan nu logga in med ditt nya lösenord.',
    });
  } catch (error) {
    next(error);
  }
};
