import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'jikmunn Inventory Management API',
      version: '1.0.0',
      description:
        'REST API for inventory management, sales, purchases, expenses, and reporting.',
      contact: {
        name: 'jikmunn',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            productId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            price: { type: 'number' },
            rating: { type: 'number' },
            stockQuantity: { type: 'integer' },
            stockThreshold: { type: 'integer', default: 10 },
          },
        },
        User: {
          type: 'object',
          properties: {
            userId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'viewer'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Sale: {
          type: 'object',
          properties: {
            saleId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer' },
            unitPrice: { type: 'number' },
            totalAmount: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
            product: { $ref: '#/components/schemas/Product' },
          },
        },
        Purchase: {
          type: 'object',
          properties: {
            purchaseId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer' },
            unitCost: { type: 'number' },
            totalCost: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
            product: { $ref: '#/components/schemas/Product' },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            expenseId: { type: 'string', format: 'uuid' },
            category: { type: 'string' },
            amount: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
