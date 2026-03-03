# ──────────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build deps
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm ci; fi

# Copy Prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source & build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Production
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Production deps only
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production; \
    else npm ci --omit=dev; fi

# Copy Prisma schema & generated client from builder
COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy compiled JS
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown appuser:nodejs logs

# Run migrations on startup via entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
