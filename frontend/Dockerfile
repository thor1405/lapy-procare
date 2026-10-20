# ========================================================
# LAPY PROCARE - FRONTEND DOCKERFILE
# Multi-Stage Build: Node build + Nginx Alpine
# Architecture: linux/arm64 (Raspberry Pi 5) & linux/amd64
# ========================================================

# Stage 1: Build React Production Artifact
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Stage 2: High-Performance Web Server & API Reverse Proxy
FROM nginx:alpine

# Copy static assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optimized Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
