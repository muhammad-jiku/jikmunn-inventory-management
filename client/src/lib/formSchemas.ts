import { z } from 'zod';

/* ── Product ── */
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Name must be 255 characters or less'),
  price: z.coerce
    .number({ message: 'Price must be a number' })
    .positive('Price must be a positive number'),
  stockQuantity: z.coerce
    .number({ message: 'Stock must be a number' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  rating: z.coerce
    .number({ message: 'Rating must be a number' })
    .min(0, 'Rating must be at least 0')
    .max(5, 'Rating must be at most 5'),
  stockThreshold: z.coerce
    .number({ message: 'Threshold must be a number' })
    .int('Threshold must be a whole number')
    .min(0, 'Threshold cannot be negative')
    .optional()
    .default(10),
});
export type ProductFormValues = z.infer<typeof productFormSchema>;

/* ── User ── */
export const userFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  email: z.string().email('Invalid email address'),
});
export type UserFormValues = z.infer<typeof userFormSchema>;

/* ── Expense ── */
export const expenseFormSchema = z.object({
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be 100 characters or less'),
  amount: z.coerce
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be positive'),
  timestamp: z.string().min(1, 'Date is required'),
});
export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

/* ── Sale ── */
export const saleFormSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce
    .number({ message: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be positive'),
  unitPrice: z.coerce
    .number({ message: 'Unit price must be a number' })
    .positive('Unit price must be positive'),
  timestamp: z.string().optional().default(''),
});
export type SaleFormValues = z.infer<typeof saleFormSchema>;

/* ── Purchase ── */
export const purchaseFormSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce
    .number({ message: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be positive'),
  unitCost: z.coerce
    .number({ message: 'Unit cost must be a number' })
    .positive('Unit cost must be positive'),
  timestamp: z.string().optional().default(''),
});
export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;
