# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Install ffmpeg in builder stage
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install ALL dependencies (including dev dependencies for build)
WORKDIR /app/server
RUN npm ci

WORKDIR /app/client
RUN npm ci

# Copy source code
WORKDIR /app
COPY server ./server
COPY client ./client

# Build frontend
WORKDIR /app/client
RUN npm run build

# Production stage
FROM node:18-alpine

# Install ffmpeg in production
RUN apk add --no-cache ffmpeg curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sermon -u 1001

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/

# Install production dependencies only
WORKDIR /app/server
RUN npm ci --only=production

# Copy server code and built frontend from builder
COPY --from=builder --chown=sermon:nodejs /app/server ./
COPY --from=builder --chown=sermon:nodejs /app/client/dist ../client/dist

# Create uploads directory with correct permissions
RUN mkdir -p /app/server/uploads && chown -R sermon:nodejs /app

# Switch to non-root user
USER sermon

# Environment variables
ENV NODE_ENV=production
ENV PORT=7001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:7001/health || exit 1

# Expose port
EXPOSE 7001

# Start application
CMD ["node", "index.js"]
