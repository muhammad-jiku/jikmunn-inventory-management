import { Router } from 'express';
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
} from '../controllers/supplierControllers';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createSupplierSchema,
  paginationSchema,
  updateSupplierSchema,
} from '../schemas';

const router = Router();

/**
 * @openapi
 * /suppliers:
 *   get:
 *     tags: [Suppliers]
 *     summary: List suppliers with pagination and search
 *     security:
 *       - bearerAuth: []
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
 *         description: Paginated list of suppliers
 *   post:
 *     tags: [Suppliers]
 *     summary: Create a new supplier
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               contact: { type: string }
 *               email: { type: string }
 *               address: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Supplier created
 */
router
  .route('/')
  .get(authenticate, validateQuery(paginationSchema), getSuppliers)
  .post(
    authenticate,
    authorize('admin', 'manager'),
    validateBody(createSupplierSchema),
    createSupplier
  );

/**
 * @openapi
 * /suppliers/{id}:
 *   get:
 *     tags: [Suppliers]
 *     summary: Get supplier by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Supplier found
 *       404:
 *         description: Supplier not found
 *   put:
 *     tags: [Suppliers]
 *     summary: Update a supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               contact: { type: string }
 *               email: { type: string }
 *               address: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Supplier updated
 *       404:
 *         description: Supplier not found
 *   delete:
 *     tags: [Suppliers]
 *     summary: Delete a supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Supplier deleted
 */
router
  .route('/:id')
  .get(authenticate, getSupplierById)
  .put(
    authenticate,
    authorize('admin', 'manager'),
    validateBody(updateSupplierSchema),
    updateSupplier
  )
  .delete(authenticate, authorize('admin'), deleteSupplier);

export default router;
