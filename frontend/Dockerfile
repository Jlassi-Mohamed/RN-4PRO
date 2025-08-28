# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./next.config.mjs  

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app with standalone output
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start Next.js server from standalone build
CMD ["node", "server.js"]
