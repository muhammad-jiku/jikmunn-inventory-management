import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { logout, updateTokens } from './authSlice';

/* ── Auth Types ── */
export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  stockThreshold?: number;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  stockThreshold?: number;
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

/* ── KPI Metrics ── */
export interface KpiMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalProducts: number;
  totalUsers: number;
  totalExpenses: number;
  expenseChange: number;
  totalSalesCount: number;
  lowStockCount: number;
}

/* ── Sales Aggregation ── */
export interface SalesAggregationItem {
  totalValue: number;
  date: string;
  changePercentage: number;
}

/* ── Reports ── */
export interface ReportData {
  profitAndLoss: {
    totalRevenue: number;
    totalCost: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
  stockValuation: number;
  topSellingProducts: {
    productId: string;
    name: string;
    totalRevenue: number;
    totalQuantity: number;
  }[];
  salesTrend: { date: string; amount: number }[];
  summary: {
    salesCount: number;
    purchasesCount: number;
    expensesCount: number;
  };
}

/* ── Low Stock ── */
export interface LowStockProduct {
  productId: string;
  name: string;
  stockQuantity: number;
  stockThreshold: number;
  price: number;
}

export interface LowStockEmailResponse {
  message: string;
  messageId?: string;
  previewUrl?: string;
  productsCount?: number;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface NewUser {
  name: string;
  email: string;
  password?: string;
  role?: string;
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

/* ── Supplier Types ── */
export interface Supplier {
  supplierId: string;
  name: string;
  contact?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewSupplier {
  name: string;
  contact?: string;
  email?: string;
  address?: string;
  notes?: string;
}

/* ── Order Types ── */
export interface OrderItem {
  orderItemId: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface Order {
  orderId: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface NewOrder {
  notes?: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}

/* ── Warehouse Types ── */
export interface WarehouseStock {
  warehouseStockId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Warehouse {
  warehouseId: string;
  name: string;
  location?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
  stocks: WarehouseStock[];
}

export interface NewWarehouse {
  name: string;
  location?: string;
  capacity?: number;
}

export interface TransferStockRequest {
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
}

/* ── Audit Log Types ── */
export interface AuditLog {
  auditLogId: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

/* ── Import Types ── */
export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: { row: number; message: string }[];
  importHistoryId: string;
}

export interface ImportHistory {
  importHistoryId: string;
  fileName: string;
  entity: string;
  totalRows: number;
  successful: number;
  failed: number;
  errors?: unknown;
  userId?: string;
  createdAt: string;
}

/* ── API Metrics Types ── */
export interface ApiMetricsData {
  period: { hours: number; since: string };
  totalRequests: number;
  averageLatencyMs: number;
  errorCount: number;
  errorRate: number;
  topEndpoints: {
    endpoint: string;
    method: string;
    requests: number;
    avgLatencyMs: number;
  }[];
  statusCodes: { statusCode: number; count: number }[];
  topUsers: { userId: string; requests: number }[];
}

/* ── Custom baseQuery with auth token injection and auto-refresh ── */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { accessToken: string | null } }).auth
      .accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try refreshing the token
    const state = api.getState() as {
      auth: { refreshToken: string | null };
    };
    const refreshTokenValue = state.auth.refreshToken;

    if (refreshTokenValue) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken: refreshTokenValue },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const tokens = refreshResult.data as TokenRefreshResponse;
        api.dispatch(updateTokens(tokens));
        // Retry the original request with the new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: 'api',
  tagTypes: [
    'DashboardMetrics',
    'Products',
    'Users',
    'Expenses',
    'Sales',
    'Purchases',
    'Suppliers',
    'Orders',
    'Warehouses',
    'AuditLogs',
    'ImportHistory',
    'Metrics',
  ],
  endpoints: (build) => ({
    /* ── Auth ── */
    registerUser: build.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    loginUser: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    refreshToken: build.mutation<
      TokenRefreshResponse,
      { refreshToken: string }
    >({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
    getMe: build.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
    updateProfile: build.mutation<AuthUser, { name?: string; email?: string }>({
      query: (body) => ({ url: '/auth/profile', method: 'PUT', body }),
    }),

    /* ── Dashboard ── */
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => '/dashboard',
      providesTags: ['DashboardMetrics'],
    }),
    getKpiMetrics: build.query<KpiMetrics, void>({
      query: () => '/dashboard/kpi',
      providesTags: ['DashboardMetrics'],
    }),
    getSalesAggregation: build.query<SalesAggregationItem[], string>({
      query: (timeframe) => ({
        url: '/dashboard/sales-aggregation',
        params: { timeframe },
      }),
      providesTags: ['DashboardMetrics'],
    }),
    getReports: build.query<
      ReportData,
      { startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({
        url: '/dashboard/reports',
        params: params || {},
      }),
      providesTags: ['DashboardMetrics'],
    }),
    getLowStockProducts: build.query<LowStockProduct[], void>({
      query: () => '/dashboard/low-stock',
      providesTags: ['DashboardMetrics', 'Products'],
    }),
    sendLowStockEmailAlert: build.mutation<
      LowStockEmailResponse,
      { email: string }
    >({
      query: (body) => ({
        url: '/dashboard/low-stock/notify',
        method: 'POST',
        body,
      }),
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

    /* ── Suppliers ── */
    getSuppliers: build.query<
      PaginatedResponse<Supplier>,
      { search?: string } | void
    >({
      query: (params) => ({
        url: '/suppliers',
        params: { limit: 100, ...(params || {}) },
      }),
      providesTags: ['Suppliers'],
    }),
    getSupplierById: build.query<Supplier, string>({
      query: (id) => `/suppliers/${id}`,
      providesTags: ['Suppliers'],
    }),
    createSupplier: build.mutation<Supplier, NewSupplier>({
      query: (body) => ({ url: '/suppliers', method: 'POST', body }),
      invalidatesTags: ['Suppliers'],
    }),
    updateSupplier: build.mutation<
      Supplier,
      { id: string } & Partial<NewSupplier>
    >({
      query: ({ id, ...body }) => ({
        url: `/suppliers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Suppliers'],
    }),
    deleteSupplier: build.mutation<void, string>({
      query: (id) => ({ url: `/suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Suppliers'],
    }),

    /* ── Orders ── */
    getOrders: build.query<
      PaginatedResponse<Order>,
      { status?: string } | void
    >({
      query: (params) => ({
        url: '/orders',
        params: { limit: 100, ...(params || {}) },
      }),
      providesTags: ['Orders'],
    }),
    getOrderById: build.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: ['Orders'],
    }),
    createOrder: build.mutation<Order, NewOrder>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Orders'],
    }),
    updateOrderStatus: build.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders', 'Products'],
    }),
    deleteOrder: build.mutation<void, string>({
      query: (id) => ({ url: `/orders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Orders'],
    }),

    /* ── Warehouses ── */
    getWarehouses: build.query<
      PaginatedResponse<Warehouse>,
      { search?: string } | void
    >({
      query: (params) => ({
        url: '/warehouses',
        params: { limit: 100, ...(params || {}) },
      }),
      providesTags: ['Warehouses'],
    }),
    getWarehouseById: build.query<Warehouse, string>({
      query: (id) => `/warehouses/${id}`,
      providesTags: ['Warehouses'],
    }),
    createWarehouse: build.mutation<Warehouse, NewWarehouse>({
      query: (body) => ({ url: '/warehouses', method: 'POST', body }),
      invalidatesTags: ['Warehouses'],
    }),
    updateWarehouse: build.mutation<
      Warehouse,
      { id: string } & Partial<NewWarehouse>
    >({
      query: ({ id, ...body }) => ({
        url: `/warehouses/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Warehouses'],
    }),
    deleteWarehouse: build.mutation<void, string>({
      query: (id) => ({ url: `/warehouses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Warehouses'],
    }),
    updateWarehouseStock: build.mutation<
      WarehouseStock,
      { warehouseId: string; productId: string; quantity: number }
    >({
      query: ({ warehouseId, productId, quantity }) => ({
        url: `/warehouses/${warehouseId}/stock/${productId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Warehouses', 'Products'],
    }),
    transferStock: build.mutation<
      { source: WarehouseStock; destination: WarehouseStock },
      TransferStockRequest
    >({
      query: (body) => ({
        url: '/warehouses/transfer',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Warehouses'],
    }),

    /* ── Audit Logs ── */
    getAuditLogs: build.query<
      PaginatedResponse<AuditLog>,
      {
        entity?: string;
        action?: string;
        userId?: string;
        page?: number;
      } | void
    >({
      query: (params) => ({
        url: '/audit-logs',
        params: { limit: 50, ...(params || {}) },
      }),
      providesTags: ['AuditLogs'],
    }),

    /* ── Import / Export ── */
    importProducts: build.mutation<ImportResult, { products: NewProduct[] }>({
      query: (body) => ({ url: '/imports/products', method: 'POST', body }),
      invalidatesTags: ['Products', 'ImportHistory'],
    }),
    bulkUpdateStock: build.mutation<
      { updated: number },
      { updates: { productId: string; stockQuantity: number }[] }
    >({
      query: (body) => ({
        url: '/imports/products/bulk-stock',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Products'],
    }),
    getImportHistory: build.query<PaginatedResponse<ImportHistory>, void>({
      query: () => ({ url: '/imports/history', params: { limit: 50 } }),
      providesTags: ['ImportHistory'],
    }),

    /* ── Barcode Lookup ── */
    getProductByBarcode: build.query<Product, string>({
      query: (barcode) => `/products/barcode/${barcode}`,
      providesTags: ['Products'],
    }),

    /* ── API Metrics ── */
    getApiMetrics: build.query<ApiMetricsData, number | void>({
      query: (hours) => ({
        url: '/metrics',
        params: { hours: hours || 24 },
      }),
      providesTags: ['Metrics'],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetDashboardMetricsQuery,
  useGetKpiMetricsQuery,
  useGetSalesAggregationQuery,
  useGetReportsQuery,
  useGetLowStockProductsQuery,
  useSendLowStockEmailAlertMutation,
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
  /* Phase 8 hooks */
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useGetWarehousesQuery,
  useGetWarehouseByIdQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useUpdateWarehouseStockMutation,
  useTransferStockMutation,
  useGetAuditLogsQuery,
  useImportProductsMutation,
  useBulkUpdateStockMutation,
  useGetImportHistoryQuery,
  useGetProductByBarcodeQuery,
  useLazyGetProductByBarcodeQuery,
  useGetApiMetricsQuery,
} = api;
