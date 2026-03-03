import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductByBarcode,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/productControllers';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createProductSchema,
  paginationSchema,
  updateProductSchema,
} from '../schemas';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with pagination
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of products
 *       500:
 *         description: Server error
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stockQuantity]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               rating: { type: number }
 *               stockQuantity: { type: integer }
 *               stockThreshold: { type: integer }
 *     responses:
 *       201:
 *         description: Product created
 *       500:
 *         description: Server error
 */
router
  .route('/')
  .get(validateQuery(paginationSchema), getProducts)
  .post(validateBody(createProductSchema), createProduct);

/**
 * @openapi
 * /products/barcode/{barcode}:
 *   get:
 *     tags: [Products]
 *     summary: Look up a product by barcode
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: No product with this barcode
 */
router.get('/barcode/:barcode', getProductByBarcode);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router
  .route('/:id')
  .get(getProductById)
  .put(validateBody(updateProductSchema), updateProduct)
  .delete(deleteProduct);

export default router;
