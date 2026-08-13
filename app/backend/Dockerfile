# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built code from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4000

# Start the server
CMD ["node", "dist/server.js"]
