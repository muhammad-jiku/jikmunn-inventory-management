import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

const SALT_ROUNDS = 12;

/** Select fields that are safe to return (excludes password) */
const safeUserSelect = {
  userId: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.users.findMany({ skip, take: limit, select: safeUserSelect }),
      prisma.users.count(),
    ]);

    sendPaginated(res, users, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving users');
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.users.findUnique({
      where: { userId: id },
      select: safeUserSelect,
    });

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    res.json(user);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving user');
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      sendError(res, 409, 'Email already registered');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password || 'changeme123',
      SALT_ROUNDS
    );
    const user = await prisma.users.create({
      data: { name, email, password: hashedPassword, role: role || 'viewer' },
      select: safeUserSelect,
    });
    res.status(201).json(user);
  } catch (_error) {
    sendError(res, 500, 'Error creating user');
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const existing = await prisma.users.findUnique({
      where: { userId: id },
    });

    if (!existing) {
      sendError(res, 404, 'User not found');
      return;
    }

    const user = await prisma.users.update({
      where: { userId: id },
      data: { name, email },
      select: safeUserSelect,
    });

    res.json(user);
  } catch (_error) {
    sendError(res, 500, 'Error updating user');
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.users.findUnique({
      where: { userId: id },
    });

    if (!existing) {
      sendError(res, 404, 'User not found');
      return;
    }

    await prisma.users.delete({ where: { userId: id } });
    res.status(204).send();
  } catch (_error) {
    sendError(res, 500, 'Error deleting user');
  }
};
