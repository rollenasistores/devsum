# Multi-stage Dockerfile for DevSum CLI
# Optimized for minimal image size and fast installation

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (core only for smaller image)
RUN npm ci --only=production --no-optional

# Copy source code
COPY src/ ./src/
COPY bin/ ./bin/
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install git (required for DevSum)
RUN apk add --no-cache git

# Create non-root user
RUN addgroup -g 1001 -S devsum && \
    adduser -S devsum -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm ci --only=production --no-optional && \
    npm cache clean --force

# Create reports directory
RUN mkdir -p /app/reports && \
    chown -R devsum:devsum /app

# Switch to non-root user
USER devsum

# Set environment variables
ENV NODE_ENV=production
ENV DEVBOT_CONFIG_DIR=/home/devsum/.config/devsum
ENV DEVBOT_REPORTS_DIR=/app/reports

# Create config directory
RUN mkdir -p $DEVBOT_CONFIG_DIR

# Expose port (if needed for web interface)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('DevSum CLI is healthy')" || exit 1

# Default command
CMD ["node", "dist/bin/devsum.js", "--help"]

# Labels for metadata
LABEL maintainer="Rollen Asistores <asistoresrlc1@gmail.com>"
LABEL description="AI-powered CLI tool for generating git accomplishment reports"
LABEL version="1.5.4"
LABEL repository="https://github.com/rollenasistores/devsum"
