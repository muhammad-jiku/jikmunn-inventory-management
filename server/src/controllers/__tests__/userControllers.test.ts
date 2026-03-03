/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

var mockFindMany: jest.Mock;
var mockFindUnique: jest.Mock;
var mockCount: jest.Mock;
var mockCreate: jest.Mock;
var mockUpdate: jest.Mock;
var mockDelete: jest.Mock;

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    users: {
      findMany: (...args: any[]) => mockFindMany(...args),
      findUnique: (...args: any[]) => mockFindUnique(...args),
      count: (...args: any[]) => mockCount(...args),
      create: (...args: any[]) => mockCreate(...args),
      update: (...args: any[]) => mockUpdate(...args),
      delete: (...args: any[]) => mockDelete(...args),
    },
  },
}));

import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../userControllers';

describe('User Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  const safeUser = {
    userId: 'u1',
    name: 'John',
    email: 'john@test.com',
    role: 'viewer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockFindMany = jest.fn();
    mockFindUnique = jest.fn();
    mockCount = jest.fn();
    mockCreate = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockReq = { query: {}, body: {}, params: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  /* ── getUsers ── */
  describe('getUsers', () => {
    it('should return paginated users', async () => {
      mockFindMany.mockResolvedValue([safeUser]);
      mockCount.mockResolvedValue(1);

      await getUsers(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: [safeUser],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    });

    it('should respect page and limit params', async () => {
      mockReq.query = { page: '3', limit: '10' };
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(30);

      await getUsers(mockReq as Request, mockRes as Response);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 })
      );
    });

    it('should return 500 on error', async () => {
      mockFindMany.mockRejectedValue(new Error('DB'));

      await getUsers(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving users',
      });
    });
  });

  /* ── getUserById ── */
  describe('getUserById', () => {
    it('should return a user by id', async () => {
      mockReq.params = { id: 'u1' };
      mockFindUnique.mockResolvedValue(safeUser);

      await getUserById(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(safeUser);
    });

    it('should return 404 when user not found', async () => {
      mockReq.params = { id: 'missing' };
      mockFindUnique.mockResolvedValue(null);

      await getUserById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'u1' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await getUserById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── createUser ── */
  describe('createUser', () => {
    it('should create a user and return 201', async () => {
      mockReq.body = { name: 'Jane', email: 'jane@test.com', password: 'pw' };
      mockFindUnique.mockResolvedValue(null); // no duplicate
      mockCreate.mockResolvedValue(safeUser);

      await createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(safeUser);
    });

    it('should return 409 when email already exists', async () => {
      mockReq.body = { name: 'Jane', email: 'john@test.com' };
      mockFindUnique.mockResolvedValue(safeUser);

      await createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email already registered',
      });
    });

    it('should return 500 on error', async () => {
      mockReq.body = { name: 'Jane', email: 'jane@test.com' };
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockRejectedValue(new Error('DB'));

      await createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── updateUser ── */
  describe('updateUser', () => {
    it('should update a user', async () => {
      const updated = { ...safeUser, name: 'Updated' };
      mockReq.params = { id: 'u1' };
      mockReq.body = { name: 'Updated' };
      mockFindUnique.mockResolvedValue(safeUser);
      mockUpdate.mockResolvedValue(updated);

      await updateUser(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when user not found', async () => {
      mockReq.params = { id: 'missing' };
      mockReq.body = { name: 'X' };
      mockFindUnique.mockResolvedValue(null);

      await updateUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'u1' };
      mockReq.body = { name: 'X' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await updateUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── deleteUser ── */
  describe('deleteUser', () => {
    it('should delete a user and return 204', async () => {
      mockReq.params = { id: 'u1' };
      mockFindUnique.mockResolvedValue(safeUser);
      mockDelete.mockResolvedValue({});

      await deleteUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockReq.params = { id: 'missing' };
      mockFindUnique.mockResolvedValue(null);

      await deleteUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'u1' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await deleteUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
