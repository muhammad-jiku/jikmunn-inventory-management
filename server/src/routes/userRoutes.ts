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

router
  .route('/')
  .get(validateQuery(paginationSchema), getUsers)
  .post(validateBody(createUserSchema), createUser);

router
  .route('/:id')
  .get(getUserById)
  .put(validateBody(updateUserSchema), updateUser)
  .delete(deleteUser);

export default router;
