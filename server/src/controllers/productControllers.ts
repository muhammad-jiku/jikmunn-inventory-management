import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

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

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, price, rating, stockQuantity } = req.body;
    const product = await prisma.products.create({
      data: {
        name,
        price,
        rating,
        stockQuantity,
      },
    });
    res.status(201).json(product);
  } catch (_error) {
    sendError(res, 500, 'Error creating product');
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, rating, stockQuantity } = req.body;

    const existing = await prisma.products.findUnique({
      where: { productId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Product not found');
      return;
    }

    const product = await prisma.products.update({
      where: { productId: id },
      data: { name, price, rating, stockQuantity },
    });

    res.json(product);
  } catch (_error) {
    sendError(res, 500, 'Error updating product');
  }
};

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
