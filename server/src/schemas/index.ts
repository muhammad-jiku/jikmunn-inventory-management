import { z } from 'zod';

/* ── Product Schemas ── */

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be 255 characters or less'),
  price: z.number().positive('Price must be a positive number'),
  rating: z
    .number()
    .min(0, 'Rating must be at least 0')
    .max(5, 'Rating must be at most 5')
    .optional(),
  stockQuantity: z
    .number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  stockThreshold: z
    .number()
    .int('Stock threshold must be a whole number')
    .min(0, 'Stock threshold cannot be negative')
    .optional()
    .default(10),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/* ── User Schemas ── */

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128)
    .optional(),
  role: z.enum(['admin', 'manager', 'viewer']).optional(),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/* ── Expense Schemas ── */

export const createExpenseSchema = z.object({
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be 100 characters or less'),
  amount: z.number().positive('Amount must be a positive number'),
  timestamp: z
    .string()
    .datetime('Invalid datetime format')
    .optional()
    .default(() => new Date().toISOString()),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

/* ── Pagination Schema ── */

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(20),
  search: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/* ── Sale Schemas ── */

export const createSaleSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be a positive number'),
  timestamp: z.string().datetime('Invalid datetime format').optional(),
});

export const updateSaleSchema = createSaleSchema.partial();

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;

/* ── Purchase Schemas ── */

export const createPurchaseSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitCost: z.number().positive('Unit cost must be a positive number'),
  timestamp: z.string().datetime('Invalid datetime format').optional(),
});

export const updatePurchaseSchema = createPurchaseSchema.partial();

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;

/* ── Auth Schemas ── */

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be 128 characters or less'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/* ── Supplier Schemas ── */

export const createSupplierSchema = z.object({
  name: z
    .string()
    .min(1, 'Supplier name is required')
    .max(255, 'Supplier name must be 255 characters or less'),
  contact: z.string().max(255).optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

/* ── Order Schemas ── */

const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be a positive number'),
});

export const createOrderSchema = z.object({
  notes: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'shipped', 'delivered', 'cancelled'], {
    message: 'Status must be one of: confirmed, shipped, delivered, cancelled',
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

/* ── Warehouse Schemas ── */

export const createWarehouseSchema = z.object({
  name: z
    .string()
    .min(1, 'Warehouse name is required')
    .max(255, 'Warehouse name must be 255 characters or less'),
  location: z.string().max(500).optional(),
  capacity: z
    .number()
    .int()
    .positive('Capacity must be a positive integer')
    .optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export const updateWarehouseStockSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
});

export const transferStockSchema = z.object({
  fromWarehouseId: z.string().uuid('Invalid source warehouse ID'),
  toWarehouseId: z.string().uuid('Invalid destination warehouse ID'),
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type UpdateWarehouseStockInput = z.infer<
  typeof updateWarehouseStockSchema
>;
export type TransferStockInput = z.infer<typeof transferStockSchema>;

/* ── Import Schemas ── */

export const importProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  rating: z.number().min(0).max(5).optional(),
  stockQuantity: z.number().int().min(0),
  barcode: z.string().optional(),
});

export const bulkStockUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
      })
    )
    .min(1, 'At least one update is required'),
});

export type ImportProductInput = z.infer<typeof importProductSchema>;
export type BulkStockUpdateInput = z.infer<typeof bulkStockUpdateSchema>;
