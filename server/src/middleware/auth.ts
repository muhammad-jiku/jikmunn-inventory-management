import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../lib/apiResponse';
import env from '../lib/env';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT access token.
 * Attaches `req.user` with { userId, role } on success.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 401, 'Access token required');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      role: string;
    };
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 401, 'Access token expired');
      return;
    }
    sendError(res, 401, 'Invalid access token');
  }
};

/**
 * Middleware factory for role-based access control.
 * Must be used AFTER `authenticate` middleware.
 *
 * @param allowedRoles - Array of roles permitted to access the route
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;

    if (!user) {
      sendError(res, 401, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      sendError(res, 403, 'You do not have permission to perform this action');
      return;
    }

    next();
  };
};
