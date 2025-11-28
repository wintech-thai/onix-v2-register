# ONIX v2 Registration Microservice - Production Dockerfile
# Multi-stage build for Next.js 16 with optimized image size

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies for build stage)
RUN npm ci && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
# This will create the standalone output
RUN npm run build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy dictionaries for i18n
COPY --from=builder --chown=nextjs:nodejs /app/dictionaries ./dictionaries

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check (uses PORT environment variable)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + process.env.PORT + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
