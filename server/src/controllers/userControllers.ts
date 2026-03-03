import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.users.findMany({ skip, take: limit }),
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
    const { name, email } = req.body;
    const user = await prisma.users.create({
      data: { name, email },
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
