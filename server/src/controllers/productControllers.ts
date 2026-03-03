import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

/**
 * List products with optional search and pagination.
 * @param req - Express request (query: search?, page?, limit?)
 * @param res - Express response with paginated product list
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = search ? { name: { contains: search } } : {};

    const [products, total] = await Promise.all([
      prisma.products.findMany({ where, skip, take: limit }),
      prisma.products.count({ where }),
    ]);

    sendPaginated(res, products, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving products');
  }
};

/**
 * Retrieve a single product by its ID.
 * @param req - Express request (params: id)
 * @param res - Express response with product or 404
 */
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.products.findUnique({
      where: { productId: id },
    });

    if (!product) {
      sendError(res, 404, 'Product not found');
      return;
    }

    res.json(product);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving product');
  }
};

/**
 * Create a new product.
 * @param req - Express request (body: name, price, rating?, stockQuantity, stockThreshold?)
 * @param res - Express response with 201 and created product
 */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, price, rating, stockQuantity, stockThreshold } = req.body;
    const product = await prisma.products.create({
      data: {
        name,
        price,
        rating,
        stockQuantity,
        ...(stockThreshold !== undefined && { stockThreshold }),
      },
    });
    res.status(201).json(product);
  } catch (_error) {
    sendError(res, 500, 'Error creating product');
  }
};

/**
 * Update an existing product by ID.
 * @param req - Express request (params: id, body: name?, price?, rating?, stockQuantity?, stockThreshold?)
 * @param res - Express response with updated product or 404
 */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, rating, stockQuantity, stockThreshold } = req.body;

    const existing = await prisma.products.findUnique({
      where: { productId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Product not found');
      return;
    }

    const product = await prisma.products.update({
      where: { productId: id },
      data: { name, price, rating, stockQuantity, stockThreshold },
    });

    res.json(product);
  } catch (_error) {
    sendError(res, 500, 'Error updating product');
  }
};

/**
 * Look up a product by its barcode.
 * @param req - Express request (params: barcode)
 * @param res - Express response with product or 404
 */
export const getProductByBarcode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { barcode } = req.params;
    const product = await prisma.products.findUnique({
      where: { barcode },
    });

    if (!product) {
      sendError(res, 404, 'No product found with this barcode');
      return;
    }

    res.json(product);
  } catch (_error) {
    sendError(res, 500, 'Error looking up barcode');
  }
};

/**
 * Delete a product by ID.
 * @param req - Express request (params: id)
 * @param res - Express response with 204 on success or 404
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.products.findUnique({
      where: { productId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Product not found');
      return;
    }

    await prisma.products.delete({ where: { productId: id } });
    res.status(204).send();
  } catch (_error) {
    sendError(res, 500, 'Error deleting product');
  }
};
