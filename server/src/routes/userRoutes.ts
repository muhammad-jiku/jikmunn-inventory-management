import { Router } from 'express';
import { getUsers } from '../controllers/userControllers';

const router = Router();

router.route('/').get(getUsers);

export default router;
