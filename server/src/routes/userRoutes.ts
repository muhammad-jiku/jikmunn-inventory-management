import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/userControllers';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createUserSchema,
  paginationSchema,
  updateUserSchema,
} from '../schemas';

const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users with pagination (admin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of users
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               role: { type: string, enum: [admin, manager, viewer] }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already registered
 */
router
  .route('/')
  .get(validateQuery(paginationSchema), getUsers)
  .post(validateBody(createUserSchema), createUser);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *   put:
 *     tags: [Users]
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router
  .route('/:id')
  .get(getUserById)
  .put(validateBody(updateUserSchema), updateUser)
  .delete(deleteUser);

export default router;
