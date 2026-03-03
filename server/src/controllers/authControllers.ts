import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../lib/apiResponse';
import env from '../lib/env';
import logger from '../lib/logger';
import prisma from '../lib/prisma';

const SALT_ROUNDS = 12;

/** Generate access + refresh tokens for a user */
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
};

/** POST /auth/register */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if email already taken
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      sendError(res, 409, 'Email already registered');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    const tokens = generateTokens(user.userId, user.role);

    res.status(201).json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    logger.error('Register error', { error });
    sendError(res, 500, 'Error registering user');
  }
};

/** POST /auth/login */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    const tokens = generateTokens(user.userId, user.role);

    res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    logger.error('Login error', { error });
    sendError(res, 500, 'Error logging in');
  }
};

/** POST /auth/refresh */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      sendError(res, 400, 'Refresh token is required');
      return;
    }

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      userId: string;
      role: string;
    };

    // Verify user still exists
    const user = await prisma.users.findUnique({
      where: { userId: decoded.userId },
    });
    if (!user) {
      sendError(res, 401, 'User no longer exists');
      return;
    }

    const tokens = generateTokens(user.userId, user.role);
    res.json(tokens);
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      sendError(res, 401, 'Invalid or expired refresh token');
      return;
    }
    logger.error('Refresh token error', { error });
    sendError(res, 500, 'Error refreshing token');
  }
};

/** GET /auth/me */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const user = await prisma.users.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error('Get me error', { error });
    sendError(res, 500, 'Error retrieving user profile');
  }
};

/** PUT /auth/profile — update own profile (name, email) */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const { name, email } = req.body;

    // If email is being changed, check for duplicates
    if (email) {
      const existing = await prisma.users.findFirst({
        where: { email, NOT: { userId } },
      });
      if (existing) {
        sendError(res, 409, 'Email already in use by another account');
        return;
      }
    }

    const updated = await prisma.users.update({
      where: { userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json(updated);
  } catch (error) {
    logger.error('Update profile error', { error });
    sendError(res, 500, 'Error updating profile');
  }
};
