import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/productControllers';

const router = Router();

router.route('/').post(createProduct).get(getProducts);

export default router;
