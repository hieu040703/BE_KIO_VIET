# Multi-stage build approach
FROM node:22.15.0-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code and config files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22.15.0-alpine AS production

# Install minimal runtime dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    libheif-tools \
    ca-certificates \
    ttf-freefont \
    wget

# Tell Puppeteer to skip installing Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary source files for runtime
COPY --from=builder /app/src/database/models ./src/database/models

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Create empty .env file (docker-compose will inject env vars)
RUN touch .env

# Create necessary directories
RUN mkdir -p uploads/temp uploads/avatars logs

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Change ownership of the app directory to nodeuser
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application using entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
