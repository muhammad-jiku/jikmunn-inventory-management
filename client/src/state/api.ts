import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummaryId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

export interface NewUser {
  name: string;
  email: string;
}

export interface Expense {
  expenseId: string;
  category: string;
  amount: number;
  timestamp: string;
}

export interface NewExpense {
  category: string;
  amount: number;
  timestamp?: string;
}

export interface Sale {
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: string;
  product?: Product;
}

export interface NewSale {
  productId: string;
  quantity: number;
  unitPrice: number;
  timestamp?: string;
}

export interface Purchase {
  purchaseId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  timestamp: string;
  product?: Product;
}

export interface NewPurchase {
  productId: string;
  quantity: number;
  unitCost: number;
  timestamp?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: 'api',
  tagTypes: [
    'DashboardMetrics',
    'Products',
    'Users',
    'Expenses',
    'Sales',
    'Purchases',
  ],
  endpoints: (build) => ({
    /* ── Dashboard ── */
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => '/dashboard',
      providesTags: ['DashboardMetrics'],
    }),

    /* ── Products ── */
    getProducts: build.query<PaginatedResponse<Product>, string | void>({
      query: (search) => ({
        url: '/products',
        params: search ? { search, limit: 100 } : { limit: 100 },
      }),
      providesTags: ['Products'],
    }),
    getProductById: build.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: ['Products'],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: '/products',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: build.mutation<
      Product,
      { id: string } & Partial<NewProduct>
    >({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products', 'DashboardMetrics'],
    }),

    /* ── Users ── */
    getUsers: build.query<PaginatedResponse<User>, void>({
      query: () => ({ url: '/users', params: { limit: 100 } }),
      providesTags: ['Users'],
    }),
    getUserById: build.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: ['Users'],
    }),
    createUser: build.mutation<User, NewUser>({
      query: (newUser) => ({
        url: '/users',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: build.mutation<User, { id: string } & Partial<NewUser>>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    /* ── Expenses ── */
    getExpensesByCategory: build.query<
      PaginatedResponse<ExpenseByCategorySummary>,
      void
    >({
      query: () => ({ url: '/expenses', params: { limit: 100 } }),
      providesTags: ['Expenses'],
    }),
    getExpenseById: build.query<Expense, string>({
      query: (id) => `/expenses/${id}`,
      providesTags: ['Expenses'],
    }),
    createExpense: build.mutation<Expense, NewExpense>({
      query: (newExpense) => ({
        url: '/expenses',
        method: 'POST',
        body: newExpense,
      }),
      invalidatesTags: ['Expenses', 'DashboardMetrics'],
    }),
    updateExpense: build.mutation<
      Expense,
      { id: string } & Partial<NewExpense>
    >({
      query: ({ id, ...body }) => ({
        url: `/expenses/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Expenses', 'DashboardMetrics'],
    }),
    deleteExpense: build.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expenses', 'DashboardMetrics'],
    }),

    /* ── Sales ── */
    getSales: build.query<PaginatedResponse<Sale>, void>({
      query: () => ({ url: '/sales', params: { limit: 100 } }),
      providesTags: ['Sales'],
    }),
    createSale: build.mutation<Sale, NewSale>({
      query: (newSale) => ({
        url: '/sales',
        method: 'POST',
        body: newSale,
      }),
      invalidatesTags: ['Sales', 'DashboardMetrics', 'Products'],
    }),
    updateSale: build.mutation<Sale, { id: string } & Partial<NewSale>>({
      query: ({ id, ...body }) => ({
        url: `/sales/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Sales', 'DashboardMetrics'],
    }),
    deleteSale: build.mutation<void, string>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sales', 'DashboardMetrics'],
    }),

    /* ── Purchases ── */
    getPurchases: build.query<PaginatedResponse<Purchase>, void>({
      query: () => ({ url: '/purchases', params: { limit: 100 } }),
      providesTags: ['Purchases'],
    }),
    createPurchase: build.mutation<Purchase, NewPurchase>({
      query: (newPurchase) => ({
        url: '/purchases',
        method: 'POST',
        body: newPurchase,
      }),
      invalidatesTags: ['Purchases', 'DashboardMetrics', 'Products'],
    }),
    updatePurchase: build.mutation<
      Purchase,
      { id: string } & Partial<NewPurchase>
    >({
      query: ({ id, ...body }) => ({
        url: `/purchases/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Purchases', 'DashboardMetrics'],
    }),
    deletePurchase: build.mutation<void, string>({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Purchases', 'DashboardMetrics'],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetExpensesByCategoryQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetSalesQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
} = api;
