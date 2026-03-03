/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

var mockFindUnique: jest.Mock;
var mockFindFirst: jest.Mock;
var mockCreate: jest.Mock;
var mockUpdate: jest.Mock;

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn(),
  JsonWebTokenError: class JsonWebTokenError extends Error {},
  TokenExpiredError: class TokenExpiredError extends Error {
    expiredAt: Date;
    constructor(message: string) {
      super(message);
      this.expiredAt = new Date();
    }
  },
}));

jest.mock('../../lib/env', () => ({
  __esModule: true,
  default: {
    JWT_SECRET: 'test-secret-key-for-jwt',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

jest.mock('../../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    users: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      findFirst: (...args: any[]) => mockFindFirst(...args),
      create: (...args: any[]) => mockCreate(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  getMe,
  login,
  refreshToken,
  register,
  updateProfile,
} from '../authControllers';

describe('Auth Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  const sampleUser = {
    userId: 'u1',
    name: 'John',
    email: 'john@test.com',
    password: 'hashed_password',
    role: 'viewer',
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockFindUnique = jest.fn();
    mockFindFirst = jest.fn();
    mockCreate = jest.fn();
    mockUpdate = jest.fn();
    mockReq = { query: {}, body: {}, params: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  /* ── register ── */
  describe('register', () => {
    it('should register a new user and return 201 with tokens', async () => {
      mockReq.body = { name: 'John', email: 'john@test.com', password: 'pass' };
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue(sampleUser);

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            userId: 'u1',
            email: 'john@test.com',
          }),
          accessToken: 'mock_token',
          refreshToken: 'mock_token',
        })
      );
    });

    it('should return 409 when email already exists', async () => {
      mockReq.body = { name: 'John', email: 'john@test.com', password: 'pass' };
      mockFindUnique.mockResolvedValue(sampleUser);

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email already registered',
      });
    });

    it('should return 500 on error', async () => {
      mockReq.body = { name: 'John', email: 'john@test.com', password: 'pass' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── login ── */
  describe('login', () => {
    it('should login with valid credentials', async () => {
      mockReq.body = { email: 'john@test.com', password: 'pass' };
      mockFindUnique.mockResolvedValue(sampleUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ userId: 'u1' }),
          accessToken: 'mock_token',
        })
      );
    });

    it('should return 401 when user not found', async () => {
      mockReq.body = { email: 'no@test.com', password: 'pass' };
      mockFindUnique.mockResolvedValue(null);

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid email or password',
      });
    });

    it('should return 401 when password does not match', async () => {
      mockReq.body = { email: 'john@test.com', password: 'wrong' };
      mockFindUnique.mockResolvedValue(sampleUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 500 on error', async () => {
      mockReq.body = { email: 'john@test.com', password: 'pass' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── refreshToken ── */
  describe('refreshToken', () => {
    it('should return new tokens with valid refresh token', async () => {
      mockReq.body = { refreshToken: 'valid_token' };
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: 'u1',
        role: 'viewer',
      });
      mockFindUnique.mockResolvedValue(sampleUser);

      await refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: 'mock_token',
        refreshToken: 'mock_token',
      });
    });

    it('should return 400 when no token provided', async () => {
      mockReq.body = {};

      await refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Refresh token is required',
      });
    });

    it('should return 401 when user no longer exists', async () => {
      mockReq.body = { refreshToken: 'valid_token' };
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: 'u1',
        role: 'viewer',
      });
      mockFindUnique.mockResolvedValue(null);

      await refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User no longer exists',
      });
    });

    it('should return 401 on invalid token', async () => {
      mockReq.body = { refreshToken: 'bad_token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid');
      });

      await refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid or expired refresh token',
      });
    });

    it('should return 500 on unexpected error', async () => {
      mockReq.body = { refreshToken: 'valid_token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected');
      });

      await refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── getMe ── */
  describe('getMe', () => {
    it('should return current user profile', async () => {
      mockReq = { ...mockReq, user: { userId: 'u1' } } as any;
      const profile = {
        userId: 'u1',
        name: 'John',
        email: 'john@test.com',
        role: 'viewer',
        createdAt: new Date(),
      };
      mockFindUnique.mockResolvedValue(profile);

      await getMe(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(profile);
    });

    it('should return 404 when user not found', async () => {
      mockReq = { ...mockReq, user: { userId: 'u1' } } as any;
      mockFindUnique.mockResolvedValue(null);

      await getMe(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq = { ...mockReq, user: { userId: 'u1' } } as any;
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await getMe(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── updateProfile ── */
  describe('updateProfile', () => {
    it('should update own profile', async () => {
      mockReq = {
        ...mockReq,
        user: { userId: 'u1' },
        body: { name: 'Updated' },
      } as any;
      const updated = {
        userId: 'u1',
        name: 'Updated',
        email: 'john@test.com',
        role: 'viewer',
      };
      mockUpdate.mockResolvedValue(updated);

      await updateProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 409 when email is already taken by another user', async () => {
      mockReq = {
        ...mockReq,
        user: { userId: 'u1' },
        body: { email: 'taken@test.com' },
      } as any;
      mockFindFirst.mockResolvedValue({
        userId: 'u2',
        email: 'taken@test.com',
      });

      await updateProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email already in use by another account',
      });
    });

    it('should allow updating email when not taken', async () => {
      mockReq = {
        ...mockReq,
        user: { userId: 'u1' },
        body: { email: 'new@test.com' },
      } as any;
      mockFindFirst.mockResolvedValue(null);
      const updated = {
        userId: 'u1',
        name: 'John',
        email: 'new@test.com',
        role: 'viewer',
      };
      mockUpdate.mockResolvedValue(updated);

      await updateProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 500 on error', async () => {
      mockReq = {
        ...mockReq,
        user: { userId: 'u1' },
        body: { name: 'X' },
      } as any;
      mockUpdate.mockRejectedValue(new Error('DB'));

      await updateProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
