import { Router } from 'express';
import {
  getMe,
  login,
  refreshToken,
  register,
  updateProfile,
} from '../controllers/authControllers';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  updateProfileSchema,
} from '../schemas';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);
router.get('/me', authenticate, getMe);
router.put(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  updateProfile
);

export default router;
