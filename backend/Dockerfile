# ========================================================
# LAPY PROCARE - BACKEND DOCKERFILE
# Multi-Arch Support: linux/arm64 (Raspberry Pi 5) & linux/amd64
# ========================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install native compilation dependencies for ARM64 / x86
RUN apk add --no-cache python3 make g++

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY src ./src

# Create uploads directory and set non-root permissions
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["node", "src/server.js"]
